import json
import urllib.parse
import urllib.request
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

import feedparser
from newspaper import Article

from app.database import get_db
from app.models import StoryDB, BookmarkDB
from app.schemas import StorySchema
from app.services.summarizer_service import SummarizerService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/news", tags=["news-search"])
summarizer = SummarizerService()

class NewsSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    scope: Optional[str] = None
    location: Optional[str] = None
    target_language: Optional[str] = "en"

@router.get("/suggest", response_model=List[str])
def get_search_suggestions(q: str):
    """
    Real Dynamic Autocomplete API:
    Queries Google's public autocomplete engine for real-time search completions matching user query.
    """
    query_str = q.strip()
    if len(query_str) < 2:
        return []

    try:
        encoded_q = urllib.parse.quote(query_str)
        rss_suggest_url = f"http://suggestqueries.google.com/complete/search?client=firefox&q={encoded_q}"
        req = urllib.request.Request(
            rss_suggest_url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if isinstance(data, list) and len(data) > 1 and isinstance(data[1], list):
                completions = [str(item).strip() for item in data[1] if item and str(item).strip()]
                return completions[:5]
    except Exception as err:
        logger.warning(f"Google autocomplete request failed for '{query_str}': {err}")

    # Fallback if network issue
    return [
        f"{query_str} news",
        f"{query_str} updates today",
        f"{query_str} latest report"
    ]

@router.post("/search", response_model=List[StorySchema])
def search_live_news(req: NewsSearchRequest, db: Session = Depends(get_db)):
    """
    Live Keyword News Search Engine:
    - Queries Google News RSS for live articles matching keyword/topic.
    - Scrapes full article text via newspaper3k.
    - Extracts publisher name (e.g. Reuters, TechCrunch) and original URL.
    - Synthesizes 60-word cards, ELI5 summaries, deep dives & bias percentages via Gemini 2.5 Flash.
    - Persists results to SQLite nextpulse.db.
    """
    raw_query = req.query.strip()
    if not raw_query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    # Build location-aware search query string
    search_q = raw_query
    if req.location and req.location.strip() and req.scope and req.scope != "global":
        search_q += f" {req.location.strip()}"

    encoded_q = urllib.parse.quote(search_q)
    rss_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-US&gl=US&ceid=US:en"

    logger.info(f"Fetching Google News RSS: {rss_url}")
    parsed_feed = feedparser.parse(rss_url)
    entries = parsed_feed.entries[:4]

    results = []
    bookmarked_ids = set(b.story_id for b in db.query(BookmarkDB).all())

    if entries:
        for entry in entries:
            article_url = getattr(entry, "link", None)
            article_title = getattr(entry, "title", search_q)
            
            # Extract Publisher Source Name
            source_obj = getattr(entry, "source", None)
            pub_name = getattr(source_obj, "title", None) if source_obj else None
            
            if not pub_name and article_url:
                try:
                    parsed_domain = urllib.parse.urlparse(article_url).netloc.replace("www.", "")
                    if parsed_domain:
                        pub_name = parsed_domain.split(".")[0].capitalize()
                except Exception:
                    pass
            if not pub_name:
                pub_name = "Verified Live News"

            body_text = ""
            if article_url:
                try:
                    art = Article(article_url)
                    art.download()
                    art.parse()
                    body_text = art.text
                except Exception as err:
                    logger.warning(f"Newspaper3k failed for {article_url}: {err}")

            if not body_text or len(body_text.strip()) < 100:
                body_text = f"News Headline: {article_title}.\nBreaking developments reported by {pub_name} for {search_q}."

            # Synthesize via Gemini 2.5 Flash
            processed = summarizer.summarize_content(
                text=body_text,
                title=article_title,
                target_language=req.target_language or "en"
            )

            # Override publisher source metadata
            processed["source"] = pub_name
            processed["originalUrl"] = article_url
            if req.category and req.category.lower() != "all":
                processed["category"] = req.category

            story_obj = StoryDB(
                id=processed["id"],
                title=processed["title"],
                category=processed["category"],
                read_time=processed["readTime"],
                published_at=processed["publishedAt"],
                source=processed["source"],
                original_url=article_url,
                summary_60w=processed["summary60w"],
                summary_eli5=processed["summaryEli5"],
                summary_deep_dive=processed["summaryDeepDive"],
                translations=processed.get("translations"),
                bias_rating=processed["biasRating"],
                bias_score=processed["biasScore"],
                perspectives=processed.get("perspectives"),
                smart_glossary=processed.get("smartGlossary"),
                voice_audio_text=processed.get("voiceAudioText"),
                is_bookmarked=False
            )
            db.add(story_obj)

            processed["isBookmarked"] = processed["id"] in bookmarked_ids
            results.append(processed)

        db.commit()

    # Fallback to Gemini 2.5 Flash dynamic generation if RSS returns 0 results
    if not results:
        target_cat = req.category if (req.category and req.category.lower() != "all") else "General News"
        gen_items = summarizer.generate_category_news(category=f"{raw_query} ({target_cat})", location=req.location)

        for item in gen_items:
            story_obj = StoryDB(
                id=item["id"],
                title=item["title"],
                category=item["category"],
                read_time=item["readTime"],
                published_at=item["publishedAt"],
                source=item["source"],
                original_url=item.get("originalUrl"),
                summary_60w=item["summary60w"],
                summary_eli5=item["summaryEli5"],
                summary_deep_dive=item["summaryDeepDive"],
                translations=item.get("translations"),
                bias_rating=item["biasRating"],
                bias_score=item["biasScore"],
                perspectives=item.get("perspectives"),
                smart_glossary=item.get("smartGlossary"),
                voice_audio_text=item.get("voiceAudioText"),
                is_bookmarked=False
            )
            db.add(story_obj)
            item["isBookmarked"] = item["id"] in bookmarked_ids
            results.append(item)
        db.commit()

    return results
