'use client';

import React from 'react';
import { SavedClip } from '../types';
import { Trash2, ExternalLink, Download, Bookmark, BriefcaseBusiness } from 'lucide-react';

interface SavedClipsProps {
  clips: SavedClip[];
  onRemove: (id: string) => void;
}

export const SavedClips: React.FC<SavedClipsProps> = ({ clips, onRemove }) => {
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(clips, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = downloadUrl;
    downloadAnchor.download = `jobintel-saved-pages-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  };

  if (clips.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-300/10 bg-indigo-300/[0.06] text-indigo-200">
          <Bookmark className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-zinc-200">Your shortlist starts here</p>
        <p className="mt-1.5 max-w-52 text-[11px] leading-relaxed text-zinc-500">
          Analyze a job or article and save the pages worth coming back to.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-sm font-semibold text-white">Your shortlist</h2>
          <p className="mt-0.5 text-[10px] text-zinc-500">{clips.length} saved {clips.length === 1 ? 'page' : 'pages'}</p>
        </div>
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[10px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {clips.map((clip) => (
        <article key={clip.id} className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-300/10 bg-indigo-300/[0.06] text-indigo-200">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
            </span>
            <h3 className="flex-1 pt-1 text-xs font-semibold leading-relaxed text-zinc-100">{clip.title}</h3>
            <button
              onClick={() => onRemove(clip.id)}
              aria-label={`Remove ${clip.title} from saved pages`}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-rose-300/[0.08] hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {clip.matchScore !== undefined && (
              <span className="rounded-full border border-indigo-300/10 bg-indigo-300/[0.06] px-2 py-1 text-[10px] font-medium text-indigo-200">
                {clip.matchScore}% match
              </span>
            )}
            <a
              href={clip.url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-[10px] text-zinc-400 transition-colors hover:text-white"
            >
              Open page
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <ul className="space-y-1.5 text-[10px] leading-relaxed text-zinc-400">
            {clip.summary.slice(0, 2).map((item, index) => (
              <li key={`${index}-${item}`} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {clip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-2.5">
              {clip.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-white/[0.04] px-2 py-1 text-[9px] text-zinc-400">{tag}</span>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};