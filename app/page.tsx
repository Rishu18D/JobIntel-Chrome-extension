'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalysisViewer } from './components/AnalysisViewer';
import { SavedClips } from './components/SavedClips';
import { SettingsModal } from './components/SettingsModal';
import { analyzeContent } from './lib/ai';
import { getSettings, saveSettings, getSavedClips, addSavedClip, removeSavedClip } from './lib/storage';
import { AnalysisResult, ExtractedPageData, SavedClip, UserSettings } from './types';
import { AlertCircle, ArrowUpRight, FileSearch, RefreshCw, Sparkles } from 'lucide-react';

function extractActivePageData(): ExtractedPageData {
  const pageTitle = document.title || '';
  const currentUrl = window.location.href;
  const jobContainerSelectors = [
    '.jobs-description',
    '.jobsearch-JobComponent',
    '[data-testid="job-description"]',
    '#jobDescriptionText',
    'main',
    'article',
  ];

  let rawText = '';
  for (const selector of jobContainerSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent && element.textContent.trim().length > 150) {
      rawText = element.textContent.trim();
      break;
    }
  }

  if (!rawText) rawText = document.body?.innerText ?? '';

  const text = rawText.replace(/\s+/g, ' ').slice(0, 10000);
  return {
    title: pageTitle,
    url: currentUrl,
    text,
    isJobPosting:
      /requirements|responsibilities|qualifications|experience|skills|job/i.test(text) ||
      /linkedin\.com\/jobs|indeed\.com|wellfound\.com/i.test(currentUrl),
  };
}

export default function SidePanelPage() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'clips'>('analyze');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>({ apiKey: '', userSkills: [] });
  const [pageData, setPageData] = useState<ExtractedPageData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [storedSettings, clips] = await Promise.all([getSettings(), getSavedClips()]);
        if (isMounted) {
          setSettings(storedSettings);
          setSavedClips(clips);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'JobIntel could not load your saved data.');
        }
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExtractAndAnalyze = async () => {
    setError(null);
    setIsLoading(true);
    setIsCurrentSaved(false);
    setAnalysis(null);
    setPageData(null);

    try {
      if (!settings.apiKey) {
        setIsSettingsOpen(true);
        throw new Error('Add your Gemini API key in settings before analyzing a page.');
      }

      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('Chrome extension APIs are unavailable. Ensure you are running this within the extension panel.');
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (typeof tab?.id !== 'number') {
        throw new Error('Unable to identify the active browser tab.');
      }

      if (!tab.url) {
        throw new Error('Chrome did not provide the active tab URL. Reload JobIntel from chrome://extensions and try again.');
      }

      const pageUrl = new URL(tab.url);
      if (pageUrl.protocol !== 'http:' && pageUrl.protocol !== 'https:') {
        throw new Error('Chrome does not allow extensions to read browser settings or internal pages. Try a regular website.');
      }

      const siteOrigin = `${pageUrl.origin}/*`;
      let granted: boolean;
      try {
        granted = await chrome.permissions.request({ origins: [siteOrigin] });
      } catch (permissionError) {
        const reason = permissionError instanceof Error
          ? permissionError.message
          : 'Chrome rejected the site-access request.';
        throw new Error(`JobIntel needs permission to read ${pageUrl.hostname}. Click Analyze this page again and allow site access. ${reason}`);
      }
      if (!granted) {
        throw new Error(`JobIntel needs permission to read ${pageUrl.hostname} before it can analyze this page.`);
      }

      let extracted: ExtractedPageData | undefined;
      try {
        const [injection] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractActivePageData,
        });
        extracted = injection?.result;
      } catch (injectionError) {
        const reason = injectionError instanceof Error ? injectionError.message : 'Chrome rejected page access.';
        throw new Error(`Chrome could not read ${pageUrl.hostname}. Check JobIntel's site access in chrome://extensions and try again. ${reason}`);
      }

      if (!extracted || !extracted.text) {
        throw new Error('Could not extract meaningful content from the page.');
      }

      setPageData(extracted);
      const aiResult = await analyzeContent(extracted, settings);
      setAnalysis(aiResult);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentClip = async () => {
    if (!pageData || !analysis) return;

    const newClip: SavedClip = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: pageData.title || 'Saved Page',
      url: pageData.url,
      timestamp: Date.now(),
      ...(analysis.isJob ? { matchScore: analysis.matchScore } : {}),
      summary: analysis.summary,
      tags: analysis.matchedSkills.slice(0, 3),
    };

    try {
      await addSavedClip(newClip);
      const updated = await getSavedClips();
      setSavedClips(updated);
      setIsCurrentSaved(true);
      setError(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'This page could not be saved.');
    }
  };

  const handleRemoveClip = async (id: string) => {
    try {
      await removeSavedClip(id);
      setSavedClips(await getSavedClips());
      setError(null);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'This saved page could not be removed.');
    }
  };

  const handleSaveSettings = async (updated: UserSettings) => {
    await saveSettings(updated);
    setSettings(updated);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col text-zinc-100">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-300/15 bg-rose-300/[0.06] p-3 text-xs text-rose-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <div className="flex-1 leading-relaxed">{error}</div>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="rounded p-0.5 text-rose-200/60 hover:text-rose-100"
            >
              ×
            </button>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="space-y-4">
            <section className="relative overflow-hidden rounded-2xl border border-indigo-300/10 bg-gradient-to-br from-indigo-400/[0.12] via-[#151827] to-[#11141d] p-4">
              <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/10 bg-indigo-200/[0.06] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-indigo-200">
                  <Sparkles className="h-3 w-3" />
                  Built for your next move
                </div>
                <h2 className="text-lg font-semibold leading-snug tracking-tight text-white">Find the role that fits.</h2>
                <p className="mt-1.5 max-w-[27rem] text-[11px] leading-relaxed text-zinc-400">
                  Get a clear read on a job posting, your skill match, and what to do next.
                </p>
              </div>

              <button
                onClick={handleExtractAndAnalyze}
                disabled={isLoading}
                className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-400 px-4 py-3 text-xs font-semibold text-[#10111b] shadow-lg shadow-indigo-950/40 transition-all hover:bg-indigo-300 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : <FileSearch className="h-4 w-4" />}
                {isLoading ? 'Reading this page…' : 'Analyze this page'}
              </button>

              {!settings.apiKey && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-black/10 px-3 py-2 text-left text-[10px] text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
                >
                  <span>Add a Gemini API key to get started</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </section>

            {analysis && (
              <>
                {pageData && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Analyzed page</p>
                    <p className="mt-1 truncate text-xs font-medium text-zinc-200">{pageData.title || 'Untitled page'}</p>
                    <p className="mt-0.5 truncate text-[10px] text-zinc-500">{pageData.url}</p>
                  </div>
                )}
                <AnalysisViewer
                  analysis={analysis}
                  onSaveClip={handleSaveCurrentClip}
                  isSaved={isCurrentSaved}
                />
              </>
            )}

            {!analysis && !isLoading && (
              <div className="flex items-start gap-3 px-1 py-1">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-zinc-400">
                  <FileSearch className="h-3.5 w-3.5" />
                </span>
                <p className="text-[10px] leading-relaxed text-zinc-500">
                  Open a job listing or article, then analyze it. Your saved pages stay on this device.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clips' && (
          <SavedClips clips={savedClips} onRemove={handleRemoveClip} />
        )}
      </main>

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}