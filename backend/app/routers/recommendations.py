import random
from collections import Counter
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import StoryDB, BookmarkDB, IngestionLogDB
from app.schemas import StorySchema
from app.routers.stories import load_initial_mock_data
from app.services.summarizer_service import SummarizerService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
summarizer = SummarizerService()

@router.get("", response_model=List[StorySchema])
def get_recommendations(
    mode: Optional[str] = "history", # "history" (For You) or "random" (Discovery)
    category: Optional[str] = None,
    scope: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Dual-Mode Recommendation Engine:
    - Mode 'history' (For You): Personalized recommendation based on category frequency in user history & bookmarks.
    - Mode 'random' (Discovery): Shuffled news cards across all categories for serendipitous discovery.
    - Dynamically generates news using Gemini 2.5 Flash if fewer than 2 DB cards match category + location.
    """
    db_stories = db.query(StoryDB).all()

    # Seed if database is empty on first boot
    if not db_stories:
        mock_data = load_initial_mock_data()
        for item in mock_data:
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
        db.commit()
        db_stories = db.query(StoryDB).all()

    bookmarked_ids = set(b.story_id for b in db.query(BookmarkDB).all())

    # Mode 2: Discovery (Random Shuffling)
    if mode == "random":
        shuffled = list(db_stories)
        random.shuffle(shuffled)
        target_list = shuffled
    else:
        # Mode 1: For You (History-Based Frequency Analysis)
        category_counts = Counter()

        for b in db.query(BookmarkDB).all():
            b_story = db.query(StoryDB).filter(StoryDB.id == b.story_id).first()
            if b_story and b_story.category:
                category_counts[b_story.category.lower()] += 3

        for log in db.query(IngestionLogDB).all():
            if log.generated_story_id:
                log_story = db.query(StoryDB).filter(StoryDB.id == log.generated_story_id).first()
                if log_story and log_story.category:
                    category_counts[log_story.category.lower()] += 1

        def calculate_score(story: StoryDB) -> float:
            score = 0.0
            s_cat = (story.category or "").lower()
            
            for cat_pref, count in category_counts.items():
                if cat_pref in s_cat or s_cat in cat_pref:
                    score += count * 10.0
            
            score += 1.0
            return score

        sorted_stories = sorted(db_stories, key=lambda s: (calculate_score(s), s.created_at), reverse=True)
        target_list = sorted_stories

    # Apply Category & Location/Scope Filtering
    result = []
    for s in target_list:
        # Category Filter
        if category and category.lower() != "all":
            cat_query = category.lower().replace("world / geopolitics", "world").replace("&", "").strip()
            story_cat = s.category.lower()
            if cat_query not in story_cat and story_cat not in cat_query:
                keywords = [k.strip() for k in category.lower().split("&") if len(k.strip()) > 2]
                match = any(k in story_cat for k in keywords)
                if not match and "all" not in category.lower():
                    continue

        # Location Filter
        if location and location.strip():
            loc_q = location.strip().lower()
            content_concat = (s.title + " " + " ".join(s.summary_60w) + " " + s.category).lower()
            if loc_q not in content_concat and scope and scope != "global":
                continue

        story_dict = {
            "id": s.id,
            "title": s.title,
            "category": s.category,
            "readTime": s.read_time,
            "publishedAt": s.published_at,
            "source": s.source,
            "originalUrl": s.original_url,
            "summary60w": s.summary_60w,
            "summaryEli5": s.summary_eli5,
            "summaryDeepDive": s.summary_deep_dive,
            "translations": s.translations,
            "biasRating": s.bias_rating,
            "biasScore": s.bias_score,
            "perspectives": s.perspectives,
            "smartGlossary": s.smart_glossary,
            "voiceAudioText": s.voice_audio_text,
            "isBookmarked": s.id in bookmarked_ids
        }
        result.append(story_dict)

    # Dynamic Gemini 2.5 Flash Generation if fewer than 2 matching stories are found
    if len(result) < 2 and (category or location):
        target_cat = category if (category and category.lower() != "all") else "World / Geopolitics"
        gen_items = summarizer.generate_category_news(category=target_cat, location=location)

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
            result.append(item)
        db.commit()

    return result
