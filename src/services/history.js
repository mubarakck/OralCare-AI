import AsyncStorage from '@react-native-async-storage/async-storage';

export const HISTORY_KEY = 'oralcare_history';

export const getHistory = async () => {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveHistoryEntry = async (entry) => {
  const history = await getHistory();
  const nextEntry = {
    ...entry,
    id: entry.id || `${Date.now()}`,
    createdAt: entry.createdAt || new Date().toISOString(),
  };
  const next = [nextEntry, ...history.filter((item) => item.id !== nextEntry.id)];
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return nextEntry;
};

export const clearHistory = async () => {
  await AsyncStorage.removeItem(HISTORY_KEY);
};
