'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Story, LanguageCode } from '../types';
import { api } from '../lib/api';
import { X, Send, Mic, Bot, User, Sparkles, Cpu } from 'lucide-react';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chips?: string[];
}

interface NewsCoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  currentLanguage: LanguageCode;
  isDemoMode?: boolean;
}

export const NewsCoPilotDrawer: React.FC<NewsCoPilotDrawerProps> = ({
  isOpen,
  onClose,
  story,
  currentLanguage,
  isDemoMode = false,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'de' ? 'de-DE' : currentLanguage === 'ja' ? 'ja-JP' : 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setInputMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        setSpeechSupported(true);
      } else {
        setSpeechSupported(false);
      }
    }
  }, [currentLanguage]);

  // Load persistent Q&A conversation history for target story from SQLite
  useEffect(() => {
    if (story) {
      let isMounted = true;
      const loadHistory = async () => {
        const historyData = await api.getChatHistory(story.id);
        if (!isMounted) return;

        if (historyData && historyData.length > 0) {
          const formatted: MessageItem[] = historyData.map((item, idx) => ({
            id: `hist-${item.id}`,
            role: item.sender === 'user' ? 'user' : 'assistant',
            content: item.message,
            chips: (idx === historyData.length - 1 && item.sender === 'assistant') ? [
              'What are the key takeaways?',
              'Who are the main entities involved?',
              'What is the broader market impact?'
            ] : undefined
          }));
          setMessages(formatted);
        } else {
          setMessages([
            {
              id: 'init-1',
              role: 'assistant',
              content: `Hello! I am your NextPulse News Co-Pilot. Ask me any questions about "${story.title}".`,
              chips: [
                'What are the key takeaways?',
                'Who are the main entities involved?',
                'What is the broader market impact?'
              ],
            },
          ]);
        }
      };

      loadHistory();
      return () => {
        isMounted = false;
      };
    }
  }, [story]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen || !story) return null;

  const articleText = `${story.title}.\n${story.summary60w.join(' ')}\n${story.summaryDeepDive || ''}`;

  const sendMessage = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    const historyForApi = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await api.chatWithArticle(
        {
          article_id: story.id,
          article_title: story.title,
          article_text: articleText,
          user_message: textToSend,
          chat_history: historyForApi,
          target_language: currentLanguage,
        },
        isDemoMode
      );

      const assistantMsg: MessageItem = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        chips: res.suggested_chips || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Co-Pilot chat error:', err);
      const fallbackMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Apologies, I encountered an issue analyzing this query. Please try again.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop click to close */}
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>

      {/* Drawer Main Container */}
      <div className="w-full max-w-lg h-full bg-neutral-950 border-l border-neutral-800 flex flex-col justify-between shadow-2xl relative z-50">
        {/* Header Bar */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 shrink-0">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-sm font-bold text-white truncate">
                  News Co-Pilot
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono text-[9px] font-medium shrink-0">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                {story.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md border bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors shrink-0"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs md:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
                {msg.role === 'user' ? (
                  <>
                    <span>YOU</span>
                    <User className="w-3 h-3 text-neutral-400" />
                  </>
                ) : (
                  <>
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>CO-PILOT</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[88%] p-3 rounded-xl leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-neutral-800 text-neutral-100 rounded-br-none border border-neutral-700'
                    : 'bg-neutral-900 text-neutral-200 rounded-bl-none border border-neutral-800'
                }`}
              >
                {msg.content}
              </div>

              {/* Dynamic Quick-Prompt Chips below Co-Pilot response */}
              {msg.role === 'assistant' && msg.chips && msg.chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1 max-w-[95%]">
                  {msg.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(chip)}
                      disabled={loading}
                      className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px] hover:border-neutral-700 hover:text-white transition-colors text-left disabled:opacity-50"
                    >
                      💡 {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator Bubble */}
          {loading && (
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                <Cpu className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>Thinking...</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Synthesizing answer from article context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Dictation Button */}
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={!speechSupported}
              title={
                speechSupported
                  ? isListening
                    ? 'Stop Voice Input'
                    : 'Voice Input (Dictate Question)'
                  : 'Speech Recognition not supported in this browser'
              }
              className={`p-2.5 rounded-lg border transition-colors shrink-0 ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : speechSupported
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  : 'bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? 'Listening to voice dictation...' : 'Ask Co-Pilot about this story...'}
              className="flex-1 px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs md:text-sm font-sans text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-lg bg-white text-neutral-950 font-bold hover:bg-neutral-200 transition-colors disabled:opacity-40 shrink-0"
              title="Send Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
