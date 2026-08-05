'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Radio } from 'lucide-react';
import { LanguageCode } from '../types';

interface VoiceAnchorProps {
  textToRead?: string;
  text?: string;
  language: LanguageCode;
}

export const VoiceAnchor: React.FC<VoiceAnchorProps> = ({ textToRead, text, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const contentToSpeak = textToRead || text || '';

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  const handleTogglePlay = () => {
    if (!isSupported || typeof window === 'undefined' || !contentToSpeak) return;

    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      synth.cancel(); // Stop any previous playback
      const utterance = new SpeechSynthesisUtterance(contentToSpeak);
      
      const langMap: Record<LanguageCode, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        es: 'es-ES',
        ja: 'ja-JP',
        de: 'de-DE',
      };
      
      utterance.lang = langMap[language] || 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      synth.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={handleTogglePlay}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors border ${
        isPlaying
          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
      }`}
      title={isPlaying ? 'Pause Voice Anchor' : 'Listen to Voice Anchor'}
    >
      {isPlaying ? (
        <>
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Pause Voice</span>
          <div className="flex items-end gap-0.5 h-3 ml-0.5">
            <span className="w-0.5 bg-cyan-400 animate-wave-1 rounded-full"></span>
            <span className="w-0.5 bg-cyan-400 animate-wave-2 rounded-full"></span>
            <span className="w-0.5 bg-cyan-400 animate-wave-3 rounded-full"></span>
            <span className="w-0.5 bg-cyan-400 animate-wave-4 rounded-full"></span>
          </div>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Voice Anchor</span>
        </>
      )}
    </button>
  );
};
