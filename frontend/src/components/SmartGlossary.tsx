'use client';

import React, { useState } from 'react';
import { GlossaryItem } from '../types';
import { BookOpen } from 'lucide-react';

interface SmartGlossaryTextProps {
  content: string;
  glossary?: GlossaryItem[];
}

export const SmartGlossaryText: React.FC<SmartGlossaryTextProps> = ({ content, glossary }) => {
  const [activeTerm, setActiveTerm] = useState<{ term: string; definition: string } | null>(null);

  if (!glossary || glossary.length === 0) {
    return <span>{content}</span>;
  }

  // Create regex pattern to match registered terms case-insensitively
  const termMap = new Map<string, string>();
  glossary.forEach(g => termMap.set(g.term.toLowerCase(), g.definition));

  const regexPattern = new RegExp(
    `\\b(${glossary.map(g => g.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi'
  );

  const parts = content.split(regexPattern);

  return (
    <span className="relative">
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const definition = termMap.get(lowerPart);

        if (definition) {
          return (
            <span key={i} className="relative inline-block group">
              <span
                onClick={() => setActiveTerm(activeTerm?.term === part ? null : { term: part, definition })}
                className="underline decoration-cyber-cyan decoration-dashed underline-offset-4 cursor-pointer text-cyber-cyan font-medium hover:bg-cyber-cyan/10 px-0.5 rounded transition-all"
              >
                {part}
              </span>

              {/* Hover & Tap Glassmorphism Tooltip */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-obsidian-900/95 border border-cyber-cyan/50 text-gray-200 text-xs rounded-xl shadow-hud-glass z-50 backdrop-blur-xl block">
                <span className="flex items-center gap-1 text-[11px] font-mono text-cyber-cyan font-bold mb-1 border-b border-cyber-cyan/20 pb-0.5">
                  <BookOpen className="w-3 h-3 text-cyber-cyan" />
                  GLOSSARY: {part}
                </span>
                <span className="block text-[11px] text-gray-300 leading-normal">{definition}</span>
              </span>
            </span>
          );
        }

        return <span key={i}>{part}</span>;
      })}

      {/* Floating Modal for Touch Devices */}
      {activeTerm && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 p-3 bg-obsidian-900 border border-cyber-cyan shadow-neon-cyan z-50 rounded-xl backdrop-blur-xl">
          <div className="flex justify-between items-center text-cyber-cyan font-mono text-xs font-bold mb-1">
            <span>SMART GLOSSARY: {activeTerm.term}</span>
            <button onClick={() => setActiveTerm(null)} className="text-gray-400 font-bold px-1">✕</button>
          </div>
          <p className="text-xs text-gray-200">{activeTerm.definition}</p>
        </div>
      )}
    </span>
  );
};
