import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { authRepository, UserProfile } from '../features/auth/repositories/auth.repository';
import { supabase } from '../services/supabase/supabase';
import { logger } from '../utils/logger';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _isInitialized: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  _isInitialized: false,

  clearError: () => set({ error: null }),

  fetchProfile: async (userId: string) => {
    try {
      const { profile, error } = await authRepository.fetchProfile(userId);
      if (!error && profile) {
        set({ profile });
      }
    } catch (err: unknown) {
      logger.error('Error fetching user profile:', err);
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const user = get().user;
    if (!user) return { error: 'Oturum açmış kullanıcı bulunamadı.' };
    set({ isLoading: true, error: null });
    try {
      const { profile, error } = await authRepository.updateProfile(user.id, data);
      if (error) {
        set({ isLoading: false, error: error.message });
        return { error: error.message };
      }
      if (profile) {
        set({ profile, isLoading: false });
      } else {
        set({
          profile: get().profile ? { ...get().profile!, ...data } : null,
          isLoading: false,
        });
      }
      return {};
    } catch (err: any) {
      const msg = err.message || 'Profil güncellenemedi.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  initializeAuth: async () => {
    if (get()._isInitialized) return;

    set({ isLoading: true, error: null });
    const { session, error } = await authRepository.getSession();

    if (error || !session?.user) {
      set({ session: null, user: null, profile: null, isAuthenticated: false, isLoading: false, _isInitialized: true });
    } else {
      set({
        session,
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
        _isInitialized: true,
      });
      await authRepository.syncUserProfileFromAuth(session.user);
      await get().fetchProfile(session.user.id);
    }

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
        });
        await authRepository.syncUserProfileFromAuth(session.user);
        await get().fetchProfile(session.user.id);
      } else {
        set({ session: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  signIn: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    const { session, user, error } = await authRepository.signIn(email, pass);

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    if (session && user) {
      set({
        session,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      await get().fetchProfile(user.id);
      return {};
    } else {
      const msg = 'Oturum açılamadı. Lütfen e-posta adresinizi doğruladığınızdan emin olun.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    const { session, user, error } = await authRepository.signInWithGoogle();

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    if (session && user) {
      set({ session, user, isAuthenticated: true, isLoading: false });
      await get().fetchProfile(user.id);
      return {};
    }

    // Session yoksa onAuthStateChange yakalayıp işleyecek
    set({ isLoading: false });
    return {};
  },

  signUp: async (email: string, pass: string, fullName: string) => {
    set({ isLoading: true, error: null });
    const { error } = await authRepository.signUp(email, pass, fullName);

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    set({ isLoading: false });
    return {};
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    const { error } = await authRepository.signOut();

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    set({
      user: null,
      profile: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
    return {};
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    const { error } = await authRepository.resetPassword(email);

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    set({ isLoading: false });
    return {};
  },
}));
