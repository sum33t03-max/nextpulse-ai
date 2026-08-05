'use client';

import React from 'react';
import { CardTone } from '../types';
import { Sparkles, Brain, BookOpen } from 'lucide-react';

interface ToneToggleProps {
  currentTone: CardTone;
  onToneChange: (tone: CardTone) => void;
}

export const ToneToggle: React.FC<ToneToggleProps> = ({ currentTone, onToneChange }) => {
  return (
    <div className="flex items-center p-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
      <button
        onClick={() => onToneChange('60w')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all duration-200 ${
          currentTone === '60w' || currentTone === 'brief'
            ? 'bg-white text-neutral-950 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
        title="Smart Brief / Executive Summary"
      >
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Brief</span>
      </button>

      <button
        onClick={() => onToneChange('eli5')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all duration-200 ${
          currentTone === 'eli5'
            ? 'bg-white text-neutral-950 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
        title="Explain Like I'm 5"
      >
        <Brain className="w-3 h-3 text-purple-400" />
        <span>ELI5</span>
      </button>

      <button
        onClick={() => onToneChange('deepdive')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all duration-200 ${
          currentTone === 'deepdive'
            ? 'bg-white text-neutral-950 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
        title="Deep Dive Narrative Synthesis"
      >
        <BookOpen className="w-3 h-3 text-emerald-400" />
        <span>Deep</span>
      </button>
    </div>
  );
};
