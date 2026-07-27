import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null; // Tip tanımlamaları eklenecek
  // Actions eklenecek
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
}));
