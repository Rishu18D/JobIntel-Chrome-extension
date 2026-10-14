'use client';

import React from 'react';
import { Sparkles, Settings, Bookmark } from 'lucide-react';

interface HeaderProps {
  activeTab: 'analyze' | 'clips';
  setActiveTab: (tab: 'analyze' | 'clips') => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-lg shadow-indigo-950/50">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-white leading-tight">JobIntel</h1>
          <p className="mt-0.5 text-[10px] text-zinc-400">Your job-search copilot</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.035] p-0.5">
          <button
            onClick={() => setActiveTab('analyze')}
            aria-pressed={activeTab === 'analyze'}
            className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-all ${
              activeTab === 'analyze'
                ? 'bg-indigo-500/15 text-indigo-200 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Analyze
          </button>
          <button
            onClick={() => setActiveTab('clips')}
            aria-pressed={activeTab === 'clips'}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all ${
              activeTab === 'clips'
                ? 'bg-indigo-500/15 text-indigo-200 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Bookmark className="h-3 w-3" aria-hidden="true" />
            Clips
          </button>
        </div>

        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};