'use client';

import React, { useState } from 'react';
import { PerspectiveItem } from '../types';
import { ShieldCheck, Info, ChevronDown } from 'lucide-react';

interface BiasMeterProps {
  rating: string; // Neutral, Optimistic, Critical
  score: number;  // 0-100
  perspectives?: PerspectiveItem[];
}

export const BiasMeter: React.FC<BiasMeterProps> = ({ rating, score, perspectives }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getBadgeStyle = () => {
    switch (rating.toLowerCase()) {
      case 'optimistic':
        return 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400';
      case 'critical':
        return 'bg-red-950/40 border-red-500/30 text-red-400';
      default:
        return 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors text-xs font-mono"
        title="View Bias & Perspective Audit"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getBadgeStyle()}`}>
          {rating} ({score}%)
        </span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${showDetails ? 'rotate-180 text-white' : ''}`} />
      </button>

      {/* Expanded Perspectives Overlay Card */}
      {showDetails && (
        <div className="absolute right-0 bottom-full mb-2 z-30 w-72 p-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl font-mono text-xs leading-relaxed space-y-2">
          <div className="flex items-center justify-between text-cyan-400 font-bold pb-1.5 border-b border-neutral-800">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Bias Audit</span>
            </span>
            <span>{rating} ({score}%)</span>
          </div>

          {perspectives && perspectives.length > 0 ? (
            <div className="space-y-1.5">
              {perspectives.map((p, idx) => (
                <div key={idx} className="flex flex-col bg-neutral-950 p-2 rounded border border-neutral-800">
                  <span className="text-neutral-200 font-bold text-[11px]">{p.perspective}</span>
                  <span className="text-neutral-400 text-[11px] mt-0.5">{p.sentiment}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-[11px]">Neutral reporting across verified peer sources.</p>
          )}
        </div>
      )}
    </div>
  );
};
