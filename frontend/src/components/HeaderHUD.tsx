'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LanguageCode } from '../types';
import { LanguageSelect } from './LanguageSelect';
import { NextPulseLogo } from './NextPulseLogo';
import { PlusCircle, Bookmark, ToggleLeft, ToggleRight, Globe, MapPin, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderHUDProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  bookmarkCount: number;
  isDemoMode?: boolean;
  onDemoModeToggle?: (enabled: boolean) => void;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
  locationInput?: string;
  onLocationChange?: (loc: string) => void;
  onReplaySplash?: () => void;
}

const CATEGORIES = [
  'All',
  'World / Geopolitics',
  'Technology & AI',
  'Economy & Business',
  'Science & Space',
  'Health & Biotech',
  'Environment & Energy',
  'Arts & Entertainment',
  'Sports',
  'Crime & Justice'
];

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentLanguage,
  onLanguageChange,
  selectedCategory,
  onCategorySelect,
  bookmarkCount,
  isDemoMode = false,
  onDemoModeToggle,
  selectedScope = 'global',
  onScopeChange,
  locationInput = '',
  onLocationChange,
  onReplaySplash,
}) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const categoryNavRef = useRef<HTMLDivElement>(null);

  // Dynamic Scroll Listener for Header Height Compression & Glassmorphism Blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Horizontal Mouse Wheel Scroll for Category Bar
  const handleCategoryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (categoryNavRef.current && e.deltaY !== 0) {
      categoryNavRef.current.scrollLeft += e.deltaY * 0.8;
    }
  };

  const handleAnalyzeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/ingest');
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-out border-b ${
        isScrolled
          ? 'bg-neutral-950/85 backdrop-blur-2xl border-neutral-800/90 shadow-xl py-2.5'
          : 'bg-neutral-950/50 backdrop-blur-md border-neutral-900/60 py-3.5'
      } px-4`}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Brand with Vector Neural Pulse SVG */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <NextPulseLogo size={28} className="w-7 h-7" glow={true} />
            <div className="flex flex-col">
              <span className="font-mono text-sm font-extrabold tracking-tight text-white flex items-center gap-1">
                NextPulse <span className="text-xs font-normal text-neutral-500 font-mono">AI</span>
              </span>
            </div>
          </Link>

          {/* Controls Right Group */}
          <div className="flex items-center gap-2.5">
            
            {/* Replay Intro Splash Button */}
            {onReplaySplash && (
              <button
                onClick={onReplaySplash}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-mono transition-colors"
                title="Replay Full-Screen Intro Splash"
              >
                <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                <span>Replay Intro</span>
              </button>
            )}

            {/* Demo Mode Switch Toggle */}
            {onDemoModeToggle && (
              <button
                onClick={() => onDemoModeToggle(!isDemoMode)}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono transition-colors ${
                  isDemoMode
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
                title="Toggle client-side offline demo mode"
              >
                {isDemoMode ? (
                  <ToggleRight className="w-4 h-4 text-amber-400" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-neutral-500" />
                )}
                <span>Demo Mode</span>
              </button>
            )}

            {/* Language Selector */}
            <LanguageSelect currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />

            {/* Bookmarks Link Button */}
            <Link
              href="/bookmarks"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Saved</span>
              {bookmarkCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  {bookmarkCount}
                </span>
              )}
            </Link>

            {/* Analyze New Button */}
            <button
              onClick={handleAnalyzeClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-neutral-950 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>
          </div>
        </div>

        {/* Category & Regional Location Selection Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          
          {/* Categories Horizontal Carousel Bar */}
          <div
            ref={categoryNavRef}
            onWheel={handleCategoryWheel}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {CATEGORIES.map((cat, idx) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <motion.button
                  key={cat}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                  onClick={() => onCategorySelect(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-white text-neutral-950 font-bold shadow-sm'
                      : 'bg-neutral-900/80 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>

          {/* Regional Scope & Location Filter Bar */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* Scope Dropdown */}
            {onScopeChange && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                <Globe className="w-3 h-3 text-neutral-500 ml-1" />
                <select
                  value={selectedScope}
                  onChange={(e) => onScopeChange(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="global" className="bg-neutral-900 text-white">Global</option>
                  <option value="country" className="bg-neutral-900 text-white">National</option>
                  <option value="state" className="bg-neutral-900 text-white">State/Local</option>
                </select>
              </div>
            )}

            {/* Location Input */}
            {onLocationChange && selectedScope !== 'global' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-white w-28 md:w-36">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => onLocationChange(e.target.value)}
                  placeholder={selectedScope === 'country' ? 'Country (e.g. India)' : 'State/City...'}
                  className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.header>
  );
};
