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
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-cyan-400">
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer font-mono text-xs pr-0 sm:pr-1"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
