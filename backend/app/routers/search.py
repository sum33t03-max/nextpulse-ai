import json
import re
import urllib.parse
import urllib.request
import logging
from typing import List, Optional, Any
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

FILLER_PATTERNS = [
    r'\blatest news\b',
    r'\blatest\b',
    r'\bnews\b',
    r'\btoday\b',
    r'\bupdates\b',
    r'\bbreaking\b',
    r'\brecent\b',
    r'\barticle\b',
    r'\barticles\b'
]

def clean_search_query(q: str) -> str:
    """
    Strips repetitive filler phrases case-insensitively before sending requests to Google News RSS.
    Examples:
      'juniper share latest news latest news' -> 'juniper share'
      'phuket latest news' -> 'phuket'
      'Virat Kohli IPL updates' -> 'Virat Kohli IPL'
    """
    cleaned = q.strip()
    for pattern in FILLER_PATTERNS:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    cleaned = ' '.join(cleaned.split())
    return cleaned if len(cleaned) >= 2 else q.strip()

CATEGORY_RSS_MAP = {
    "sports": "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en",
    "technology & ai": "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
    "economy & business": "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
    "science & space": "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en",
    "health & biotech": "https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en",
    "world / geopolitics": "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en",
    "arts & entertainment": "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en",
    "environment & energy": "https://news.google.com/rss/search?q=environment+energy+climate&hl=en-US&gl=US&ceid=US:en",
    "crime & justice": "https://news.google.com/rss/search?q=crime+justice+court&hl=en-US&gl=US&ceid=US:en"
}

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
    query_str = clean_search_query(q)
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

def fetch_rss_entries(query_str: str, location: Optional[str] = None, scope: Optional[str] = None) -> List[Any]:
    """
    Helper function to query Google News RSS with location scope.
    """
    search_q = query_str
    if location and location.strip() and scope and scope != "global":
        search_q += f" {location.strip()}"

    encoded_q = urllib.parse.quote(search_q)
    rss_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-US&gl=US&ceid=US:en"
    logger.info(f"Fetching Google News RSS: {rss_url}")
    parsed_feed = feedparser.parse(rss_url)
    return parsed_feed.entries

@router.post("/search", response_model=List[StorySchema])
def search_live_news(req: NewsSearchRequest, db: Session = Depends(get_db)):
    """
    Live Keyword News Search Engine with 3-Tier Fallback Strategy:
    1. Primary Attempt: Cleaned query search.
    2. Secondary Fallback: Split main keywords if 0 results returned.
    3. Tertiary Fallback: Category RSS headlines or 30-day extended recency window.
    4. Dynamic Synthesis Fallback: Gemini generated cards so the UI never displays an empty state.
    """
    raw_query = req.query.strip()
    category_low = (req.category or "").strip().lower()

    # Case 1: Category click with blank search input -> Fetch category headlines
    if not raw_query and category_low and category_low != "all":
        category_rss = CATEGORY_RSS_MAP.get(category_low)
        if category_rss:
            parsed_feed = feedparser.parse(category_rss)
            entries = parsed_feed.entries[:4]
        else:
            entries = fetch_rss_entries(req.category, req.location, req.scope)[:4]
        cleaned_query = req.category
    else:
        cleaned_query = clean_search_query(raw_query or "breaking news")
        
        # --- TIER 1: Primary Attempt (Cleaned exact query) ---
        entries = fetch_rss_entries(cleaned_query, req.location, req.scope)[:4]

        # --- TIER 2: Secondary Fallback (Split main keywords) ---
        if not entries:
            words = [w for w in cleaned_query.split() if len(w) > 2]
            if len(words) > 1:
                fallback_query = " ".join(words[:2])
                logger.info(f"Tier 2 Fallback: Searching '{fallback_query}'")
                entries = fetch_rss_entries(fallback_query, req.location, req.scope)[:4]

        # --- TIER 3: Tertiary Fallback (Primary keyword or Category RSS) ---
        if not entries:
            words = [w for w in cleaned_query.split() if len(w) > 2]
            primary_word = words[0] if words else cleaned_query
            logger.info(f"Tier 3 Fallback: Searching '{primary_word}'")
            entries = fetch_rss_entries(primary_word, req.location, req.scope)[:4]

    results = []
    bookmarked_ids = set(b.story_id for b in db.query(BookmarkDB).all())

    if entries:
        for entry in entries:
            article_url = getattr(entry, "link", None)
            article_title = getattr(entry, "title", cleaned_query)
            
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
                body_text = f"News Headline: {article_title}.\nBreaking developments reported by {pub_name} for {cleaned_query}."

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

    # --- TIER 4: Guaranteed Dynamic Synthesis Fallback ---
    # If all RSS methods yielded 0 results, generate 2-3 dynamic stories via Gemini so UI NEVER shows empty state!
    if not results:
        target_cat = req.category if (req.category and req.category.lower() != "all") else "General News"
        gen_items = summarizer.generate_category_news(category=f"{cleaned_query} ({target_cat})", location=req.location)

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
