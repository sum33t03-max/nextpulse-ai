from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatMessageDB
from app.schemas import ArticleChatRequest, ArticleChatResponse
from app.services.summarizer_service import SummarizerService

router = APIRouter(prefix="/chat", tags=["chat"])
summarizer = SummarizerService()

@router.get("/{article_id}")
def get_chat_history(article_id: str, db: Session = Depends(get_db)):
    """
    Returns saved Q&A chat history for a specific article ordered by created_at ASC.
    """
    messages = (
        db.query(ChatMessageDB)
        .filter(ChatMessageDB.article_id == article_id)
        .order_by(ChatMessageDB.created_at.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "sender": m.sender,
            "message": m.message,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in messages
    ]

@router.post("/article", response_model=ArticleChatResponse)
def chat_article(req: ArticleChatRequest, db: Session = Depends(get_db)):
    """
    Contextual News Co-Pilot Endpoint:
    Answers follow-up queries on any news card using Gemini 2.5 Flash and persists chat history to SQLite.
    """
    if not req.user_message or not req.user_message.strip():
        raise HTTPException(status_code=400, detail="User message cannot be empty.")

    article_id = req.article_id or f"article-{hash(req.article_title)}"

    # 1. Save user question to SQLite
    user_msg_db = ChatMessageDB(
        article_id=article_id,
        sender="user",
        message=req.user_message.strip()
    )
    db.add(user_msg_db)
    db.commit()

    # 2. Retrieve previous chat history for system context
    db_history = (
        db.query(ChatMessageDB)
        .filter(ChatMessageDB.article_id == article_id)
        .order_by(ChatMessageDB.created_at.asc())
        .all()
    )
    
    history_list = [
        {"role": m.sender, "content": m.message}
        for m in db_history[:-1] # Exclude the user question we just added
    ]

    # If request passed client-side chat_history, merge if db_history was empty
    if not history_list and req.chat_history:
        history_list = [msg.model_dump() for msg in req.chat_history]

    # 3. Call Gemini 2.5 Flash Co-Pilot
    res = summarizer.chat_with_article(
        article_title=req.article_title,
        article_text=req.article_text,
        user_message=req.user_message,
        chat_history=history_list,
        target_language=req.target_language or "en"
    )

    # 4. Save AI response to SQLite
    ai_msg_db = ChatMessageDB(
        article_id=article_id,
        sender="assistant",
        message=res["reply"]
    )
    db.add(ai_msg_db)
    db.commit()

    return res
