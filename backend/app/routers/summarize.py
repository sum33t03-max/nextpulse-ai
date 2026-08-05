from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import SummarizeRequest, StorySchema
from app.services.summarizer_service import SummarizerService
from app.database import get_db
from app.models import StoryDB

router = APIRouter(prefix="/summarize", tags=["summarize"])
summarizer = SummarizerService()

@router.post("", response_model=StorySchema)
def summarize_text(req: SummarizeRequest, db: Session = Depends(get_db)):
    result = summarizer.summarize_content(
        text=req.content,
        title=req.title,
        target_language=req.target_language or "en"
    )

    story_obj = StoryDB(
        id=result["id"],
        title=result["title"],
        category=result["category"],
        read_time=result["readTime"],
        published_at=result["publishedAt"],
        source=result["source"],
        original_url=result.get("originalUrl"),
        summary_60w=result["summary60w"],
        summary_eli5=result["summaryEli5"],
        summary_deep_dive=result["summaryDeepDive"],
        translations=result.get("translations"),
        bias_rating=result["biasRating"],
        bias_score=result["biasScore"],
        perspectives=result.get("perspectives"),
        smart_glossary=result.get("smartGlossary"),
        voice_audio_text=result.get("voiceAudioText"),
        is_bookmarked=False
    )
    db.add(story_obj)
    db.commit()
    return result
