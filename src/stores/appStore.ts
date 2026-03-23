/**
 * App Global State Store
 * ネットワーク状態、UI状態、キャッシュ制御を管理
 */

import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface AppState {
  // Network status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Cache control
  useCache: boolean;
  setUseCache: (use: boolean) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Network status
  isOnline: true,
  setIsOnline: (online) => set({ isOnline: online }),

  // Cache control
  useCache: true,
  setUseCache: (use) => set({ useCache: use }),

  // Toast notifications
  toasts: [],
  addToast: (message, type, duration = 3000) =>
    set((state) => {
      const id = `toast-${Date.now()}`;
      const newToasts = [...state.toasts, { id, message, type, duration }];

      // Auto-remove toast after duration
      if (duration) {
        setTimeout(() => {
          set((s) => ({
            toasts: s.toasts.filter((t) => t.id !== id),
          }));
        }, duration);
      }

      return { toasts: newToasts };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error state
  globalError: null,
  setGlobalError: (error) => set({ globalError: error }),
}));
