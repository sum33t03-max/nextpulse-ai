'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Story, CardTone, LanguageCode } from '../types';
import { ToneToggle } from './ToneToggle';
import { VoiceAnchor } from './VoiceAnchor';
import { BiasMeter } from './BiasMeter';
import { Bookmark, ExternalLink, Clock, Share2, Layers, BookOpen, Bot, Trash2, Globe } from 'lucide-react';
import { api } from '../lib/api';
import { safeFormatDate } from '../lib/utils';

interface StoryCardProps {
  story: Story;
  currentLanguage: LanguageCode;
  index?: number;
  onBookmarkToggle?: (storyId: string, isBookmarked: boolean) => void;
  onOpenCoPilot?: (story: Story) => void;
  onDeleteStory?: (storyId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  currentLanguage,
  index = 0,
  onBookmarkToggle,
  onOpenCoPilot,
  onDeleteStory,
}) => {
  const [tone, setTone] = useState<CardTone>('brief');
  const [isBookmarked, setIsBookmarked] = useState(story?.isBookmarked || false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!story) return null;

  // Defensive field fallbacks
  const category = story.category || "General News";
  const source = story.source || "Verified Source";
  const readTime = story.readTime || "1 min read";
  const publishedAt = safeFormatDate(story.publishedAt);
  const biasRating = story.biasRating || "Neutral";
  const biasScore = typeof story.biasScore === 'number' ? story.biasScore : 90;

  // Derive translated content if selected language is non-English
  const translated = story.translations && story.translations[currentLanguage];

  const title = translated?.title || story.title || "Untitled News Story";
  const summary60w = (translated?.summary60w && translated.summary60w.length > 0)
    ? translated.summary60w
    : (story.summary60w && story.summary60w.length > 0)
    ? story.summary60w
    : ["Executive summary details currently being processed for this story."];

  const summaryEli5 = (translated?.summaryEli5 && translated.summaryEli5.length > 0)
    ? translated.summaryEli5
    : (story.summaryEli5 && story.summaryEli5.length > 0)
    ? story.summaryEli5
    : ["Here are the key points explained simply!"];

  const summaryDeepDive = translated?.summaryDeepDive || story.summaryDeepDive || "Comprehensive deep dive synthesis currently active.";

  // Prepare text string for Voice Anchor
  const voiceText = translated
    ? `${title}. ${summary60w.join(' ')}`
    : story.voiceAudioText || `${title}. ${summary60w.join(' ')}`;

  const handleBookmarkClick = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (onBookmarkToggle) onBookmarkToggle(story.id, nextState);
    await api.toggleBookmark(story.id);
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(story.originalUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    if (onDeleteStory) {
      onDeleteStory(story.id);
    }
    await api.deleteStory(story.id);
  };

  // Alternating side entrance: Even cards slide from LEFT (-100px), Odd cards slide from RIGHT (+100px)
  const initialX = index % 2 === 0 ? -100 : 100;

  return (
    <motion.article
      initial={{ opacity: 0, x: initialX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 70, damping: 15 }}
      style={{ willChange: 'transform, opacity' }}
      className={`minimal-card rounded-xl p-4 md:p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 ease-out hover:border-neutral-700 hover:shadow-xl relative ${
        isDeleting ? 'opacity-0 scale-95 transition-all duration-300' : ''
      }`}
    >
      <div className="space-y-4">
        
        {/* Top Header Row: Responsive Flex-Wrap Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-neutral-800/60 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-[11px] font-medium shrink-0">
              {category}
            </span>

            {/* Publisher Source Badge with safe truncation */}
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px] font-medium shrink-0 flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">{source}</span>
            </span>

            <div className="flex items-center gap-1 text-neutral-400 font-mono text-[11px] shrink-0">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span>{readTime}</span>
            </div>

            {publishedAt && (
              <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                • {publishedAt}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
            {/* Tone Switcher (Brief | ELI5 | Deep) */}
            <ToneToggle currentTone={tone} onToneChange={setTone} />

            <div className="flex items-center gap-1 shrink-0">
              {/* Trash Delete Action */}
              <button
                onClick={handleDeleteClick}
                className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors ml-1"
                title="Delete Article"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Bookmark Action */}
              <button
                onClick={handleBookmarkClick}
                className={`p-1.5 rounded-md transition-colors ${
                  isBookmarked
                    ? 'text-cyan-400 bg-cyan-950/40'
                    : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Story Headline */}
        <h2 className="font-sans text-base md:text-lg font-bold text-white leading-snug tracking-tight hover:text-neutral-200 transition-colors">
          {title}
        </h2>

        {/* Card View Mode Body Content (Cross-fade Transition) */}
        <div className="min-h-[140px] text-xs md:text-sm font-sans text-neutral-300 transition-opacity duration-200 ease-in-out">
          
          {/* MODE 1: Smart Brief / Executive Summary */}
          {(tone === '60w' || tone === 'brief') && (
            <ul className="space-y-2">
              {summary60w.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-cyan-400 font-bold font-mono mt-0.5">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {/* MODE 2: ELI5 Simple Breakdown */}
          {tone === 'eli5' && (
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain Like I'm 5</span>
              </div>
              <ul className="space-y-1.5">
                {summaryEli5.map((point, i) => (
                  <li key={i} className="leading-relaxed text-neutral-300">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* MODE 3: Deep Dive Narrative Analysis */}
          {tone === 'deepdive' && (
            <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800 max-h-56 overflow-y-auto font-sans text-xs leading-relaxed space-y-2 text-neutral-300">
              <div className="flex items-center gap-1.5 text-xs font-mono text-purple-400 font-bold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Deep Dive Synthesis</span>
              </div>
              <p className="whitespace-pre-line">{summaryDeepDive}</p>
            </div>
          )}

        </div>

        {/* Smart Glossary (Positioned BELOW Content Cards) */}
        {story.smartGlossary && story.smartGlossary.length > 0 && (
          <div className="pt-2 border-t border-neutral-800/60">
            <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 mb-1.5">
              <span>SMART GLOSSARY:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {story.smartGlossary.map((item, idx) => (
                <div
                  key={idx}
                  className="group/item relative inline-flex items-center px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:border-neutral-700 transition-colors"
                >
                  <span className="font-semibold text-neutral-200">{item.term}</span>
                  {/* Definition Tooltip */}
                  <div className="absolute bottom-full left-0 mb-1 hidden group-hover/item:block z-30 w-56 p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-sans shadow-xl leading-snug">
                    {item.definition}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Card Footer Action Bar: Responsive Flex-Wrap */}
      <div className="pt-4 mt-4 border-t border-neutral-800/60 flex items-center justify-between gap-2.5 font-mono text-xs flex-wrap">
        
        {/* Left Actions: Voice Anchor, Ask Co-Pilot, Verify Source */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice Anchor Audio Player */}
          <VoiceAnchor text={voiceText} language={currentLanguage} />

          {/* Ask Co-Pilot Drawer Trigger */}
          {onOpenCoPilot && (
            <button
              onClick={() => onOpenCoPilot(story)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors text-xs font-mono font-medium shrink-0"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask Co-Pilot</span>
            </button>
          )}

          {/* Read Full Source / Verify Source Action Button */}
          {story.originalUrl && (
            <a
              href={story.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors text-xs font-mono font-medium shrink-0"
              title={`Verify original story on ${source}`}
            >
              <span>Verify Source</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          )}
        </div>

        {/* Right Actions: Bias Rating & Share */}
        <div className="flex items-center gap-2 shrink-0">
          <BiasMeter rating={biasRating} score={biasScore} />

          <button
            onClick={handleShareClick}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title={copied ? 'Link Copied!' : 'Share Article'}
          >
            <Share2 className={`w-3.5 h-3.5 ${copied ? 'text-green-400' : ''}`} />
          </button>
        </div>

      </div>
    </motion.article>
  );
};
