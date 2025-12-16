import {create} from 'zustand';

interface AppState {
  isOffline: boolean;
  isDarkMode: boolean;
  setOfflineStatus: (status: boolean) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>(set => ({
  isOffline: false,
  isDarkMode: true, // Default to true based on previous requirements
  setOfflineStatus: status => set({isOffline: status}),
  toggleTheme: () => set(state => ({isDarkMode: !state.isDarkMode})),
}));
