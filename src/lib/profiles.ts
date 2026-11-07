export interface Profile {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const PROFILE_KEY = 'studio-profiles';
export const ACTIVE_PROFILE_KEY = 'studio-active-profile';
const ACTIVE_KEY = ACTIVE_PROFILE_KEY;
export const STORAGE_PREFIX = 'studio-habit-tracker';

export const storageKey = (profileId: string) => `${STORAGE_PREFIX}:${profileId}`;

export function getProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId(): string {
  return localStorage.getItem(ACTIVE_KEY) || 'default';
}

export function setActiveProfileId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

/** First-run migration: move legacy storage into the default profile. */
export function migrateLegacyStorage() {
  const legacy = localStorage.getItem(STORAGE_PREFIX);
  if (!legacy) return;
  const target = storageKey('default');
  if (!localStorage.getItem(target)) {
    localStorage.setItem(target, legacy);
  }
  // keep legacy as a backup until user switches explicitly
}

export function ensureDefaultProfile() {
  const profiles = getProfiles();
  if (!profiles.find(p => p.id === 'default')) {
    saveProfiles([{ id: 'default', name: 'Me', color: '#0f766e', createdAt: new Date().toISOString() }, ...profiles]);
  }
  migrateLegacyStorage();
}

export function createProfile(name: string, color: string): Profile {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const profiles = [...getProfiles(), { id, name, color, createdAt: new Date().toISOString() }];
  saveProfiles(profiles);
  return { id, name, color, createdAt: new Date().toISOString() };
}

export function deleteProfile(id: string) {
  if (id === 'default') return;
  saveProfiles(getProfiles().filter(p => p.id !== id));
  localStorage.removeItem(storageKey(id));
  if (getActiveProfileId() === id) setActiveProfileId('default');
}