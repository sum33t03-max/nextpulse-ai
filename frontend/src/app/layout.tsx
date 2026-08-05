import React from 'react';
import './globals.css';
import { SmoothScrollProvider } from '../components/SmoothScrollProvider';

export const metadata = {
  title: 'NextPulse AI - Minimal Multilingual AI News Summarizer & Co-Pilot',
  description: 'AI-driven news summarizer delivering 60-word cards, ELI5 breakdowns, deep dive analysis, and multi-modal ingestion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen selection:bg-white selection:text-neutral-950 font-sans antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
