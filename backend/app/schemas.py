from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Optional, Dict, Any

class PerspectiveItem(BaseModel):
    perspective: str
    sentiment: str

class GlossaryItem(BaseModel):
    term: str
    definition: str

class TranslationContent(BaseModel):
    title: str
    summary60w: List[str]
    summaryEli5: List[str]
    summaryDeepDive: str

class StorySchema(BaseModel):
    id: str
    title: str
    category: str
    readTime: str
    publishedAt: str
    source: str
    originalUrl: Optional[str] = None
    summary60w: List[str]
    summaryEli5: List[str]
    summaryDeepDive: str
    translations: Optional[Dict[str, TranslationContent]] = None
    biasRating: str
    biasScore: int
    perspectives: Optional[List[PerspectiveItem]] = None
    smartGlossary: Optional[List[GlossaryItem]] = None
    voiceAudioText: Optional[str] = None
    isBookmarked: bool = False

    @field_validator('biasScore', mode='before')
    @classmethod
    def parse_bias_score(cls, v: Any) -> int:
        import unicodedata
        if isinstance(v, int):
            return v
        if v is None:
            return 90
        try:
            s = str(v).strip()
            if s.isdigit():
                return min(max(int(s), 0), 100)
            converted = []
            for char in s:
                try:
                    converted.append(str(unicodedata.digit(char)))
                except ValueError:
                    pass
            ascii_digits = "".join(converted)
            if ascii_digits:
                return min(max(int(ascii_digits), 0), 100)
        except Exception:
            pass
        return 90

    class Config:
        from_attributes = True

class IngestRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None
    title: Optional[str] = None
    target_language: Optional[str] = "en"

class IngestUrlRequest(BaseModel):
    url: str
    target_language: Optional[str] = "en"

class IngestTextRequest(BaseModel):
    title: str
    text: str
    target_language: Optional[str] = "en"

class SummarizeRequest(BaseModel):
    content: str
    title: Optional[str] = None
    target_language: Optional[str] = "en"

class BookmarkRequest(BaseModel):
    story_id: str

class ArticleChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ArticleChatRequest(BaseModel):
    article_id: Optional[str] = None
    article_title: str
    article_text: str
    user_message: str
    chat_history: Optional[List[ArticleChatMessage]] = []
    target_language: Optional[str] = "en"

class ArticleChatResponse(BaseModel):
    reply: str
    suggested_chips: List[str]
