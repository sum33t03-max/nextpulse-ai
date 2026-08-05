'use client';

import React from 'react';
import { LanguageCode } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSelectProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-700/80 border border-cyber-cyan/30 text-xs text-cyber-cyan shadow-neon-cyan/20">
        <Globe className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          className="bg-transparent text-gray-200 focus:outline-none cursor-pointer font-mono text-xs pr-1"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-obsidian-800 text-gray-100">
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
