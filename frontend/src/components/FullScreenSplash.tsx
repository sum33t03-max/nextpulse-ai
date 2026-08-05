'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NextPulseLogo } from './NextPulseLogo';
import { FastForward } from 'lucide-react';

interface FullScreenSplashProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export const FullScreenSplash: React.FC<FullScreenSplashProps> = ({
  forceShow = false,
  onComplete,
}) => {
  // Always trigger on page load/refresh by default
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    if (!isVisible) {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
      return;
    }

    // Disable body scroll while 5-second intro splash screen is active
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Auto-dismiss timer after exactly 5000ms (5 seconds)
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    // Escape key listener for fast dismissal during testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isVisible, handleDismiss]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="full-screen-splash"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] pointer-events-auto bg-neutral-950 flex flex-col items-center justify-center cursor-pointer selection:bg-none transition-opacity duration-500"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Central Logo & Text Container */}
          <div className="relative z-10 flex flex-col items-center gap-6 pointer-events-none">
            
            {/* 1. Logo Draw & Growth Animation (0s - 1.5s) */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.2, 1], opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 shadow-2xl backdrop-blur-xl"
            >
              <NextPulseLogo size={72} className="w-18 h-18" glow={true} />
            </motion.div>

            {/* 2. Text Shimmer & Tracking (1.5s - 4.0s) */}
            <motion.div
              initial={{ opacity: 0, y: 15, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
              transition={{ duration: 2.5, delay: 1.5, ease: 'easeOut' }}
              className="flex flex-col items-center text-center gap-2"
            >
              <h1 className="font-mono text-2xl md:text-3xl font-extrabold text-white tracking-[0.35em] uppercase">
                NEXTPULSE<span className="text-cyan-400">.AI</span>
              </h1>
              <p className="font-mono text-xs text-neutral-400 tracking-widest uppercase">
                MULTILINGUAL AI NEWS SUMMARIZER & CO-PILOT
              </p>
            </motion.div>

            {/* 3. Stream Status Indicator (4.0s - 5.0s) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.8] }}
              transition={{ duration: 1.0, delay: 3.5 }}
              className="flex items-center gap-2 mt-4 font-mono text-xs text-neutral-500"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>INITIALIZING INTELLIGENCE STREAM...</span>
            </motion.div>

          </div>

          {/* Fail-Safe Skip Button & Note */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute bottom-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white font-mono text-xs transition-colors z-20"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
