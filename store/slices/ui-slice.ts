import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ColorScheme } from '@/constants/theme';

export type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD';

interface UIState {
  toasts: Toast[];
  dbReady: boolean;
  themeMode: ColorScheme;
  selectedCurrency: CurrencyCode;

  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  setDbReady: (ready: boolean) => void;
  setThemeMode: (mode: ColorScheme) => void;
  setCurrency: (code: CurrencyCode) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    toasts: [],
    dbReady: false,
    themeMode: 'dark',
    selectedCurrency: 'INR',

    showToast: (message, type = 'info') => {
      const id = `toast_${Date.now()}`;
      set(s => { s.toasts.push({ id, message, type }); });
      setTimeout(() => {
        set(s => { s.toasts = s.toasts.filter(t => t.id !== id); });
      }, 3000);
    },

    dismissToast: (id) => {
      set(s => { s.toasts = s.toasts.filter(t => t.id !== id); });
    },

    setDbReady: (ready) => {
      set(s => { s.dbReady = ready; });
    },

    setThemeMode: (mode) => {
      set(s => { s.themeMode = mode; });
    },

    setCurrency: (code) => {
      set(s => { s.selectedCurrency = code; });
    },
  }))
);
