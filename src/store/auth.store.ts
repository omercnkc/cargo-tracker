import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/supabase';
import { Database } from '../types/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  fetchProfile: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        set({ profile: data });
      }
    } catch (err: any) {
      console.log('Error fetching user profile:', err);
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        set({ session: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
        return;
      }

      if (session?.user) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
        });
        await get().fetchProfile(session.user.id);
      } else {
        set({ session: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err: any) {
      set({ session: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
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
        await get().fetchProfile(session.user.id);
      } else {
        set({ session: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  signIn: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { error: error.message };
      }

      if (data.session && data.user) {
        set({
          session: data.session,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        await get().fetchProfile(data.user.id);
      }
      return {};
    } catch (err: any) {
      const msg = err.message || 'Giriş yapılırken bir hata oluştu.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signUp: async (email: string, pass: string, fullName: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { error: error.message };
      }

      if (data.user) {
        // Create user row if auto-trigger isn't activated
        await supabase.from('users').upsert({
          id: data.user.id,
          full_name: fullName,
        } as any);
      }

      set({ isLoading: false });
      return {};
    } catch (err: any) {
      const msg = err.message || 'Kayıt olunurken bir hata oluştu.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
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
    } catch (err: any) {
      const msg = err.message || 'Çıkış yapılırken bir hata oluştu.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        set({ isLoading: false, error: error.message });
        return { error: error.message };
      }
      set({ isLoading: false });
      return {};
    } catch (err: any) {
      const msg = err.message || 'Şifre sıfırlama e-postası gönderilemedi.';
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },
}));
