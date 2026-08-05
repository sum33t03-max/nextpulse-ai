'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Cpu, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

interface SearchBarProps {
  onSearchSubmit: (query: string) => void;
  isSearching: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchSubmit, isSearching }) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced Suggestion Fetching (300ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsFetchingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const items = await api.getSearchSuggestions(trimmed);
        setSuggestions(items);
        setShowDropdown(items.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.warn('Failed to fetch suggestions:', err);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click-Outside Listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (selected: string) => {
    setQuery(selected);
    setShowDropdown(false);
    onSearchSubmit(selected);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    onSearchSubmit(query.trim());
  };

  return (
    <div ref={containerRef} className="relative w-full mt-4">
      {/* Prominent Search Bar Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 focus-within:border-neutral-700 transition-all shadow-md">
          <Search className="w-4 h-4 text-cyan-400 ml-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search any news topic, keyword, or breaking event..."
            className="flex-1 bg-transparent px-2 py-2 text-xs md:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-5 py-2 rounded-lg bg-cyan-500 text-neutral-950 font-mono text-xs font-bold hover:bg-cyan-400 transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {isSearching ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search News</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sleek Autocomplete Glassmorphism Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl shadow-2xl overflow-hidden font-mono text-xs text-left animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-neutral-800/80 text-[10px] text-neutral-500 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span>Trending Suggestions</span>
            </span>
            {isFetchingSuggestions && <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />}
          </div>

          <ul className="py-1">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-neutral-800 text-cyan-400 font-bold'
                      : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`} />
                    <span className="truncate">{item}</span>
                  </span>
                  <span className="text-[10px] text-neutral-600 font-normal ml-2">Select ↵</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
