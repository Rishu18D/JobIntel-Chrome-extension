import { SavedClip, UserSettings } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'jobintel_settings',
  CLIPS: 'jobintel_clips',
};

const DEFAULT_SETTINGS: UserSettings = {
  apiKey: '',
  userSkills: [
    'JavaScript',
    'TypeScript',
    'React.js',
    'Node.js',
    'Express.js',
    'MongoDB',
    'PostgreSQL',
    'Next.js',
    'Tailwind CSS',
    'REST APIs',
    'Java',
    'Python'
  ],
};

function requireExtensionStorage(): typeof chrome.storage.local {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    throw new Error('Chrome extension storage is unavailable. Open JobIntel from Chrome to continue.');
  }
  return chrome.storage.local;
}

function isUserSettings(value: unknown): value is UserSettings {
  return (
    !!value &&
    typeof value === 'object' &&
    'apiKey' in value &&
    typeof value.apiKey === 'string' &&
    'userSkills' in value &&
    Array.isArray(value.userSkills) &&
    value.userSkills.every((skill) => typeof skill === 'string')
  );
}

function isSavedClip(value: unknown): value is SavedClip {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'url' in value &&
    typeof value.url === 'string' &&
    'timestamp' in value &&
    typeof value.timestamp === 'number' &&
    'summary' in value &&
    Array.isArray(value.summary) &&
    value.summary.every((item) => typeof item === 'string') &&
    'tags' in value &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string') &&
    (!('matchScore' in value) || typeof value.matchScore === 'number')
  );
}

export async function getSettings(): Promise<UserSettings> {
  const storage = requireExtensionStorage();
  const result = await storage.get(STORAGE_KEYS.SETTINGS);
  const stored = result[STORAGE_KEYS.SETTINGS] as unknown;
  return isUserSettings(stored)
    ? { ...DEFAULT_SETTINGS, ...stored, userSkills: [...stored.userSkills] }
    : { ...DEFAULT_SETTINGS, userSkills: [...DEFAULT_SETTINGS.userSkills] };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const storage = requireExtensionStorage();
  await storage.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function getSavedClips(): Promise<SavedClip[]> {
  const storage = requireExtensionStorage();
  const result = await storage.get(STORAGE_KEYS.CLIPS);
  const stored = result[STORAGE_KEYS.CLIPS] as unknown;
  return Array.isArray(stored) ? stored.filter(isSavedClip) : [];
}

export async function addSavedClip(clip: SavedClip): Promise<void> {
  const storage = requireExtensionStorage();
  const current = await getSavedClips();
  const updated = [clip, ...current.filter((c) => c.url !== clip.url)];
  await storage.set({ [STORAGE_KEYS.CLIPS]: updated });
}

export async function removeSavedClip(id: string): Promise<void> {
  const storage = requireExtensionStorage();
  const current = await getSavedClips();
  const updated = current.filter((c) => c.id !== id);
  await storage.set({ [STORAGE_KEYS.CLIPS]: updated });
}