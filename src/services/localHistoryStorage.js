import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@xplore_command_history';
const MAX_ENTRIES = 500;

const buildStorageKey = (userId) => `${STORAGE_KEY_PREFIX}:${String(userId).trim().toLowerCase()}`;

const normalizeEntry = (item, index) => ({
  id: String(item?.id ?? `${item?.action || 'command'}-${item?.timestamp ?? index}`),
  action: item?.action ?? 'Comando',
  success: Boolean(item?.success),
  timestamp: item?.timestamp ?? null,
});

const readEntries = async (userId) => {
  const raw = await AsyncStorage.getItem(buildStorageKey(userId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeEntries = async (userId, entries) => {
  await AsyncStorage.setItem(buildStorageKey(userId), JSON.stringify(entries));
};

export const loadLocalHistory = async (userId) => {
  if (!userId) return [];

  const entries = await readEntries(userId);
  return entries
    .slice()
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    .map(normalizeEntry);
};

export const saveLocalCommand = async (userId, action, success, detail = '') => {
  if (!userId) return null;

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    success: Boolean(success),
    timestamp: Date.now(),
    detail: detail || '',
  };

  const current = await readEntries(userId);
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  await writeEntries(userId, next);

  return entry;
};

export const shouldLogMove = (lastLoggedAt, debounceMs = 3000) => {
  const now = Date.now();
  if (now - lastLoggedAt < debounceMs) {
    return false;
  }
  return now;
};
