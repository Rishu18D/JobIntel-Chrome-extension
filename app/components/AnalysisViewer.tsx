'use client';

import React from 'react';
import { AnalysisResult } from '../types';
import { MatchBadge } from './MatchBadge';
import { CheckCircle2, XCircle, Lightbulb, BookmarkPlus, ListChecks } from 'lucide-react';

interface AnalysisViewerProps {
  analysis: AnalysisResult;
  onSaveClip: () => void;
  isSaved: boolean;
}

export const AnalysisViewer: React.FC<AnalysisViewerProps> = ({
  analysis,
  onSaveClip,
  isSaved,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {analysis.isJob ? (
          <MatchBadge score={analysis.matchScore} />
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-300/10 bg-sky-300/[0.08] text-sky-200">
              <ListChecks className="h-4 w-4" />
            </span>
            Page summary
          </div>
        )}
        <button
          onClick={onSaveClip}
          disabled={isSaved}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition-all ${
            isSaved
              ? 'border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-200 cursor-default'
              : 'border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]'
          }`}
        >
          <BookmarkPlus className="h-3.5 w-3.5" />
          {isSaved ? 'Saved' : 'Save page'}
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {analysis.isJob ? 'Role Breakdown' : 'Executive Summary'}
        </h3>
        <ul className="space-y-2.5 text-xs leading-relaxed text-zinc-300">
          {analysis.summary.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-300" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Matched vs Missing Skills */}
      {analysis.isJob && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.035] p-3.5">
            <h4 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Matched ({analysis.matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {analysis.matchedSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-emerald-300/10 bg-emerald-300/[0.07] px-2 py-1 text-[10px] text-emerald-100"
                >
                  {s}
                </span>
              ))}
              {analysis.matchedSkills.length === 0 && (
                <span className="text-[10px] text-zinc-500 italic">None detected</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-rose-300/10 bg-rose-300/[0.035] p-3.5">
            <h4 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-200">
              <XCircle className="h-3 w-3" />
              Gaps ({analysis.missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {analysis.missingSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-rose-300/10 bg-rose-300/[0.07] px-2 py-1 text-[10px] text-rose-100"
                >
                  {s}
                </span>
              ))}
              {analysis.missingSkills.length === 0 && (
                <span className="text-[10px] text-zinc-500 italic">No gaps spotted</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actionable Insights */}
      {analysis.actionableInsights.length > 0 && (
        <div className="rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-4">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-200">
            <Lightbulb className="h-3.5 w-3.5" />
            Strategic Suggestions
          </h3>
          <ul className="space-y-2 text-xs leading-relaxed text-zinc-300">
            {analysis.actionableInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-300">→</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};