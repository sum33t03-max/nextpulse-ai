import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import StoryDB, BookmarkDB
from app.schemas import StorySchema, BookmarkRequest

router = APIRouter(tags=["stories"])

MOCK_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "mock_news_data.json")

def load_initial_mock_data():
    if os.path.exists(MOCK_DATA_PATH):
        with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/stories", response_model=List[StorySchema])
@router.get("/feed", response_model=List[StorySchema])
def get_stories(
    category: Optional[str] = None,
    scope: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns feed of stories from database ordered by creation date (newest first).
    If database is empty on first startup, seeds initial records from mock_news_data.json.
    Supports filtering by category, scope (global, national, local), and location.
    """
    db_stories = db.query(StoryDB).order_by(StoryDB.created_at.desc()).all()
    
    # If DB is empty, seed from mock_news_data.json
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
        db_stories = db.query(StoryDB).order_by(StoryDB.created_at.desc()).all()

    # Get active bookmarks list
    bookmarked_ids = set(b.story_id for b in db.query(BookmarkDB).all())

    result = []
    for s in db_stories:
        # Category filter
        if category and category.lower() != "all":
            cat_query = category.lower().replace("world / geopolitics", "world").replace("&", "").strip()
            story_cat = s.category.lower()
            if cat_query not in story_cat and story_cat not in cat_query:
                # Allow partial keyword matching
                keywords = [k.strip() for k in category.lower().split("&") if len(k.strip()) > 2]
                match = any(k in story_cat for k in keywords)
                if not match and "all" not in category.lower():
                    continue

        # Location / Scope filter matching
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

    return result


@router.get("/stories/{story_id}", response_model=StorySchema)
def get_story_by_id(story_id: str, db: Session = Depends(get_db)):
    story = db.query(StoryDB).filter(StoryDB.id == story_id).first()
    if not story:
        mock_data = load_initial_mock_data()
        for item in mock_data:
            if item["id"] == story_id:
                return item
        raise HTTPException(status_code=404, detail="Story not found")
    
    is_bookmarked = db.query(BookmarkDB).filter(BookmarkDB.story_id == story_id).first() is not None
    return {
        "id": story.id,
        "title": story.title,
        "category": story.category,
        "readTime": story.read_time,
        "publishedAt": story.published_at,
        "source": story.source,
        "originalUrl": story.original_url,
        "summary60w": story.summary_60w,
        "summaryEli5": story.summary_eli5,
        "summaryDeepDive": story.summary_deep_dive,
        "translations": story.translations,
        "biasRating": story.bias_rating,
        "biasScore": story.bias_score,
        "perspectives": story.perspectives,
        "smartGlossary": story.smart_glossary,
        "voiceAudioText": story.voice_audio_text,
        "isBookmarked": is_bookmarked
    }


@router.post("/stories/{story_id}/bookmark")
def toggle_bookmark(story_id: str, db: Session = Depends(get_db)):
    existing = db.query(BookmarkDB).filter(BookmarkDB.story_id == story_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"story_id": story_id, "isBookmarked": False}
    else:
        new_bm = BookmarkDB(story_id=story_id)
        db.add(new_bm)
        db.commit()
        return {"story_id": story_id, "isBookmarked": True}


@router.delete("/stories/{story_id}")
@router.delete("/feed/{story_id}")
def delete_story(story_id: str, db: Session = Depends(get_db)):
    """
    Deletes the specified article from nextpulse.db SQLite database.
    """
    story = db.query(StoryDB).filter(StoryDB.id == story_id).first()
    if story:
        db.delete(story)

    bookmark = db.query(BookmarkDB).filter(BookmarkDB.story_id == story_id).first()
    if bookmark:
        db.delete(bookmark)

    db.commit()
    return {"success": True, "message": "Article deleted successfully."}
