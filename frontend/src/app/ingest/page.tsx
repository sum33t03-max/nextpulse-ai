'use client';

import React, { useState } from 'react';
import { HeaderHUD } from '../../components/HeaderHUD';
import { StoryCard } from '../../components/StoryCard';
import { Story, LanguageCode } from '../../types';
import { api } from '../../lib/api';
import { Globe, FileText, FileSearch, Cpu, Sparkles, ArrowLeft, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function IngestPage() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'document'>('url');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Form inputs
  const [urlInput, setUrlInput] = useState<string>('');
  const [textTitle, setTextTitle] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Status
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultStory, setResultStory] = useState<Story | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleIngestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setResultStory(null);

    try {
      const res = await api.ingestUrl(urlInput, currentLanguage, isDemoMode);
      if (res && res.status === 'error') {
        setErrorMsg(res.message);
      } else {
        setResultStory(res);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to extract URL. Try pasting raw text instead.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIngestText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setResultStory(null);

    try {
      const res = await api.ingestText(
        textTitle || 'Custom Ingested Article',
        textContent,
        currentLanguage,
        isDemoMode
      );
      if (res && res.status === 'error') {
        setErrorMsg(res.message);
      } else {
        setResultStory(res);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process raw text passage.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setResultStory(null);

    try {
      const formData = new FormData();
      formData.append('file', docFile);
      formData.append('target_language', currentLanguage);
      const res = await api.ingestDocument(formData, currentLanguage, isDemoMode);
      if (res && res.status === 'error') {
        setErrorMsg(res.message);
      } else {
        setResultStory(res);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process document/image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDocFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <HeaderHUD
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        selectedCategory="All"
        onCategorySelect={() => {}}
        bookmarkCount={0}
        isDemoMode={isDemoMode}
        onDemoModeToggle={setIsDemoMode}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Feed
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multimodal Ingestion // Gemini 2.5 Flash Vision</span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-bold text-white">News Analyzer</h1>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                Paste a link, type text, or upload a news image to get an instant AI summary.
              </p>
            </div>
          </div>

          {/* Input Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-6 p-1 rounded-lg bg-neutral-950 border border-neutral-800">
            <button
              onClick={() => { setActiveTab('url'); setResultStory(null); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-mono transition-colors ${
                activeTab === 'url'
                  ? 'bg-white text-neutral-950 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>URL Scraper</span>
            </button>

            <button
              onClick={() => { setActiveTab('text'); setResultStory(null); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-mono transition-colors ${
                activeTab === 'text'
                  ? 'bg-white text-neutral-950 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Raw Text</span>
            </button>

            <button
              onClick={() => { setActiveTab('document'); setResultStory(null); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-mono transition-colors ${
                activeTab === 'document'
                  ? 'bg-white text-neutral-950 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Scan Document / Image</span>
            </button>
          </div>
        </div>

        {/* Tab Form Containers */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
          {activeTab === 'url' && (
            <form onSubmit={handleIngestUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 font-medium mb-2">
                  TARGET ARTICLE URL ({currentLanguage.toUpperCase()})
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://techcrunch.com/article-slug or https://news.ycombinator.com..."
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs md:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-lg bg-white text-neutral-950 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Extracting Article & Summarizing...' : 'Process & Generate Smart Brief'}
              </button>
            </form>
          )}

          {activeTab === 'text' && (
            <form onSubmit={handleIngestText} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 font-medium mb-2">
                  STORY TITLE (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. RBI Interest Rates, Parliament Session & CWG Updates"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs md:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors mb-3"
                />

                <label className="block text-xs font-mono text-neutral-400 font-medium mb-2">
                  RAW TEXT CONTENT ({currentLanguage.toUpperCase()})
                </label>
                <textarea
                  required
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste single or multi-topic news text passage here..."
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs md:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-lg bg-white text-neutral-950 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Summarizing via Gemini 2.5 Flash...' : 'Generate Smart Brief'}
              </button>
            </form>
          )}

          {activeTab === 'document' && (
            <form onSubmit={handleIngestDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 font-medium mb-2">
                  SCAN NEWS DOCUMENT / IMAGE ({currentLanguage.toUpperCase()})
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center bg-neutral-950 transition-colors ${
                    isDragging
                      ? 'border-neutral-400 bg-neutral-900'
                      : docFile
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${docFile ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,text/plain"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="document-upload-input"
                  />
                  <label htmlFor="document-upload-input" className="cursor-pointer">
                    <span className="text-xs font-mono text-neutral-200 block font-medium">
                      {docFile ? `Selected: ${docFile.name}` : 'Drag & drop or click to select document / image'}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 block mt-1">
                      Supports PNG, JPG, WEBP screenshots, PDF, and TXT files
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !docFile}
                className="w-full py-3 rounded-lg bg-white text-neutral-950 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Scanning news document with Gemini Vision...' : 'Scan & Generate Smart Brief'}
              </button>
            </form>
          )}

          {/* Status Banner */}
          {isProcessing && (
            <div className="mt-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
              <div className="font-mono text-xs">
                <p className="text-neutral-200 font-medium">Scanning news document with Gemini Vision...</p>
                <p className="text-neutral-500 text-[11px]">Extracting text & generating adaptive Smart Brief in {currentLanguage.toUpperCase()}...</p>
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-red-300 font-mono text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-200 mb-0.5">Scanning Notice</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Generated Result Preview */}
        {resultStory && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ingestion Successful // Card Saved to Persistent Feed</span>
            </div>

            <StoryCard story={resultStory} currentLanguage={currentLanguage} />
          </div>
        )}
      </main>
    </div>
  );
}
