from typing import Dict, Any

class VoiceService:
    """
    Interface for Text-To-Speech audio synthesis.
    In Phase 1, generates audio anchor metadata and TTS payload.
    """
    def generate_audio_anchor(self, text: str, lang: str = "en") -> Dict[str, Any]:
        return {
            "text": text,
            "language": lang,
            "audioUrl": None, # Fallback to Web Speech API client side
            "durationSeconds": len(text.split()) * 0.4
        }
