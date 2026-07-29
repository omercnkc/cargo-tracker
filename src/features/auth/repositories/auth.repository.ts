import { supabase } from '../../../services/supabase/supabase';
import { Database } from '../../../types/database.types';
import { User, Session } from '@supabase/supabase-js';

export type UserProfile = Database['public']['Tables']['users']['Row'];

export class AuthRepository {
  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return { session: null, error };
      return { session: data.session, error: null };
    } catch (err) {
      return { session: null, error: err instanceof Error ? err : new Error('Failed to get session') };
    }
  }

  async fetchProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return { profile: null, error };
      return { profile: data, error: null };
    } catch (err) {
      return { profile: null, error: err instanceof Error ? err : new Error('Failed to fetch profile') };
    }
  }

  async signIn(email: string, pass: string): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) return { session: null, user: null, error };
      return { session: data.session, user: data.user, error: null };
    } catch (err) {
      return { session: null, user: null, error: err instanceof Error ? err : new Error('Sign in failed') };
    }
  }

  async signUp(email: string, pass: string, fullName: string): Promise<{ user: User | null; error: Error | null }> {
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

      if (error) return { user: null, error };

      if (data.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          full_name: fullName,
          avatar_url: null,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await supabase.from('users').upsert(newUser as any);
      }

      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err : new Error('Sign up failed') };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign out failed') };
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Password reset failed') };
    }
  }
}

export const authRepository = new AuthRepository();
