from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.schemas import IngestRequest, IngestUrlRequest, IngestTextRequest
from app.services.ingestion_service import IngestionService
from app.database import get_db
from app.models import StoryDB, IngestionLogDB
from typing import Dict, Any, Optional

router = APIRouter(prefix="/ingest", tags=["ingest"])
ingestion = IngestionService()

def save_story_to_db(result: dict, input_type: str, raw_content: str, db: Session):
    if result.get("status") == "error":
        return result

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

    log_obj = IngestionLogDB(
        input_type=input_type,
        source_content=raw_content[:1000],
        generated_story_id=result["id"]
    )
    db.add(log_obj)
    db.commit()
    return result

@router.post("")
def ingest_general(req: IngestRequest, db: Session = Depends(get_db)):
    """
    Main endpoint: Ingests a news URL or raw text passage.
    """
    target_lang = req.target_language or "en"
    if req.url:
        result = ingestion.process_url(req.url, target_language=target_lang)
        return save_story_to_db(result, "url", req.url, db)
    elif req.text:
        result = ingestion.process_text(req.title or "Ingested Article", req.text, target_language=target_lang)
        return save_story_to_db(result, "text", req.text, db)
    else:
        raise HTTPException(status_code=400, detail="Either 'url' or 'text' must be provided in request body.")

@router.post("/document")
async def ingest_document(
    file: UploadFile = File(...),
    target_language: Optional[str] = Form("en"),
    db: Session = Depends(get_db)
):
    """
    Multimodal Document/Image scanning endpoint. Accepts images (.png, .jpg, .jpeg, .webp) or text/PDF docs.
    Uses Gemini 2.5 Flash vision capabilities for zero-shot OCR & 60-word card summarization.
    """
    filename = file.filename or "document_upload.png"
    mime_type = file.content_type or "image/png"
    
    # Infer mime_type from filename if default or unknown
    if mime_type == "application/octet-stream" or not mime_type:
        ext = filename.split(".")[-1].lower()
        if ext in ["jpg", "jpeg"]:
            mime_type = "image/jpeg"
        elif ext == "png":
            mime_type = "image/png"
        elif ext == "webp":
            mime_type = "image/webp"
        elif ext == "pdf":
            mime_type = "application/pdf"
        elif ext == "txt":
            mime_type = "text/plain"

    file_bytes = await file.read()
    result = ingestion.process_document(
        file_bytes=file_bytes,
        mime_type=mime_type,
        filename=filename,
        target_language=target_language or "en"
    )
    return save_story_to_db(result, "document", f"Uploaded Document/Image: {filename} ({mime_type})", db)

@router.post("/url")
def ingest_url(req: IngestUrlRequest, db: Session = Depends(get_db)):
    result = ingestion.process_url(req.url, target_language=req.target_language or "en")
    return save_story_to_db(result, "url", req.url, db)

@router.post("/text")
def ingest_text(req: IngestTextRequest, db: Session = Depends(get_db)):
    result = ingestion.process_text(req.title, req.text, target_language=req.target_language or "en")
    return save_story_to_db(result, "text", f"{req.title}\n{req.text}", db)

@router.post("/media")
async def ingest_media(file: UploadFile = File(...), media_type: str = Form("audio"), db: Session = Depends(get_db)):
    file_name = file.filename or "uploaded_media.bin"
    result = ingestion.process_media(media_type, file_name)
    return save_story_to_db(result, media_type, f"Uploaded file: {file_name}", db)
