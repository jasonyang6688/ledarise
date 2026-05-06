import { create } from 'zustand';

interface AdminThemeStore {
  dark: boolean;
  setDark: (dark: boolean) => void;
  toggleDark: () => void;
}

export const useAdminTheme = create<AdminThemeStore>((set, get) => ({
  dark: false,
  setDark: (dark) => set({ dark }),
  toggleDark: () => set({ dark: !get().dark }),
}));
