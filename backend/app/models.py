from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, JSON
from datetime import datetime
from app.database import Base

class StoryDB(Base):
    __tablename__ = "stories"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, index=True)
    read_time = Column(String, default="1 min read")
    published_at = Column(String, default="Just now")
    source = Column(String, default="NextPulse Ingestion Engine")
    original_url = Column(String, nullable=True)
    
    # Store summaries as JSON arrays / strings
    summary_60w = Column(JSON, nullable=False)
    summary_eli5 = Column(JSON, nullable=False)
    summary_deep_dive = Column(Text, nullable=False)
    
    # Multilingual JSON
    translations = Column(JSON, nullable=True)
    
    # Bias & perspective JSON
    bias_rating = Column(String, default="Neutral")
    bias_score = Column(Integer, default=90)
    perspectives = Column(JSON, nullable=True)
    
    # Smart glossary & voice
    smart_glossary = Column(JSON, nullable=True)
    voice_audio_text = Column(Text, nullable=True)
    
    is_bookmarked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class BookmarkDB(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    story_id = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class IngestionLogDB(Base):
    __tablename__ = "ingestion_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    input_type = Column(String, nullable=False) # url, text, media
    source_content = Column(Text, nullable=False)
    generated_story_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessageDB(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    article_id = Column(String, index=True, nullable=False)
    sender = Column(String, nullable=False) # 'user' or 'assistant'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
