'use client';

import React from 'react';

interface MatchBadgeProps {
  score: number;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ score }) => {
  const getBadgeColor = (val: number) => {
    if (val >= 80) return 'text-emerald-200 border-emerald-300/15 bg-emerald-300/[0.06]';
    if (val >= 50) return 'text-amber-200 border-amber-300/15 bg-amber-300/[0.06]';
    return 'text-rose-200 border-rose-300/15 bg-rose-300/[0.06]';
  };

  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${getBadgeColor(score)}`}>
      <div className="text-2xl font-bold tracking-tight">{score}%</div>
      <div className="text-[11px] leading-snug">
        <p className="font-semibold text-zinc-100">Role match</p>
        <p className="text-[10px] opacity-70">Based on your skills</p>
      </div>
    </div>
  );
};