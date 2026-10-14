'use client';

import React, { useState } from 'react';
import { UserSettings } from '../types';
import { X, Key, Plus, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserSettings) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [skills, setSkills] = useState<string[]>(settings.userSkills);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedSkill = newSkill.trim();
    if (normalizedSkill && !skills.some((skill) => skill.toLowerCase() === normalizedSkill.toLowerCase())) {
      setSkills([...skills, normalizedSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave({ apiKey: apiKey.trim(), userSkills: skills });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Settings could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#11141e] p-5 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 id="settings-title" className="text-sm font-semibold text-white">Make it yours</h2>
            <p className="mt-1 text-[11px] text-zinc-400">Tune your profile for better matches.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 py-4">
          {/* API Key */}
          <div className="space-y-1.5">
            <label htmlFor="gemini-key" className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
              <Key className="h-3.5 w-3.5 text-indigo-300" />
              Gemini API key
            </label>
            <input
              id="gemini-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-400/70 focus:outline-none"
            />
            <p className="text-[10px] leading-relaxed text-zinc-500">
              Saved on this device only. Page text is sent to Google Gemini when you analyze.
              {' '}<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">Get a key</a>
            </p>
          </div>

          {/* User Skills */}
          <div className="space-y-1.5">
            <label htmlFor="new-skill" className="text-xs font-medium text-zinc-200">Your skills</label>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                id="new-skill"
                type="text"
                maxLength={48}
                placeholder="Add a skill, e.g. Docker"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-400/70 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Add skill"
                className="rounded-lg border border-white/10 bg-white/[0.06] px-3 text-zinc-200 transition-colors hover:bg-white/10"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 rounded-full border border-indigo-300/10 bg-indigo-400/[0.08] py-1 pl-2.5 pr-1.5 text-[10px] text-indigo-100"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="rounded-full p-0.5 text-zinc-500 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {saveError && (
          <p role="alert" className="mb-3 rounded-lg border border-rose-400/15 bg-rose-400/[0.08] px-3 py-2 text-[11px] text-rose-200">
            {saveError}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-white/[0.08] pt-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-indigo-400 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};