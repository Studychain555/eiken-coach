import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateCreator } from 'zustand';

/**
 * Zustand persistence middleware for AsyncStorage
 * Automatically saves and restores state from device storage
 */
export const createPersistMiddleware =
  <T extends Record<string, any>>(
    key: string,
    whitelist?: (keyof T)[]
  ): ((config: StateCreator<T>) => StateCreator<T>) =>
  (config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) => {
    // Initialize: Load from AsyncStorage on startup
    const initialState = config(set, get, api);

    // Load persisted state if available
    const loadPersistedState = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          set(parsed);
        }
      } catch (error) {
        console.error(`[Storage] Failed to load ${key}:`, error);
      }
    };

    // Initialize on mount
    loadPersistedState();

    // Setup auto-save on state changes
    const originalSet = api.setState || set;
    api.setState = (update: any) => {
      originalSet(update);

      // Save to storage after state update
      setTimeout(() => {
        saveToStorage();
      }, 0);
    };

    const saveToStorage = async () => {
      try {
        const state = get();
        const toSave = whitelist
          ? Object.fromEntries(
              whitelist
                .map((key) => [key, state[key as string]])
                .filter(([_, v]) => v !== undefined)
            )
          : state;

        await AsyncStorage.setItem(key, JSON.stringify(toSave));
      } catch (error) {
        console.error(`[Storage] Failed to save ${key}:`, error);
      }
    };

    return initialState;
  };

/**
 * Utility to manually persist specific store data
 */
export const persistStoreData = async (key: string, data: Record<string, any>) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`[Storage] Failed to persist ${key}:`, error);
  }
};

/**
 * Utility to manually restore store data
 */
export const restoreStoreData = async (key: string) => {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error(`[Storage] Failed to restore ${key}:`, error);
    return null;
  }
};

/**
 * Clear all persisted store data
 */
export const clearAllStoreData = async (keys: string[]) => {
  try {
    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
  } catch (error) {
    console.error('[Storage] Failed to clear store data:', error);
  }
};

/**
 * Get all persisted keys
 */
export const getAllStoredKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('[Storage] Failed to get stored keys:', error);
    return [];
  }
};
