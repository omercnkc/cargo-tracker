import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../../services/supabase/supabase';
import { Database } from '../../../types/database.types';
import { User, Session } from '@supabase/supabase-js';
import { formatTitleCaseTR, formatPhoneClean, formatEmail } from '../../../utils/stringFormatters';

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

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const formattedUpdates: Partial<UserProfile> = { ...updates };
      if (updates.full_name) {
        formattedUpdates.full_name = formatTitleCaseTR(updates.full_name);
      }
      if (updates.phone) {
        formattedUpdates.phone = formatPhoneClean(updates.phone);
      }

      const updateData = {
        ...formattedUpdates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase.from('users') as any)
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) return { profile: null, error };

      if (formattedUpdates.full_name !== undefined || formattedUpdates.avatar_url !== undefined) {
        await supabase.auth.updateUser({
          data: {
            ...(formattedUpdates.full_name !== undefined ? { full_name: formattedUpdates.full_name } : {}),
            ...(formattedUpdates.avatar_url !== undefined ? { avatar_url: formattedUpdates.avatar_url } : {}),
          },
        });
      }

      return { profile: data, error: null };
    } catch (err) {
      return { profile: null, error: err instanceof Error ? err : new Error('Profile update failed') };
    }
  }

  async signIn(email: string, pass: string): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { session: null, user: null, error };
      return { session: data.session, user: data.user, error: null };
    } catch (err) {
      return { session: null, user: null, error: err instanceof Error ? err : new Error('Sign in failed') };
    }
  }

  async signUp(email: string, pass: string, fullName: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const cleanEmail = formatEmail(email);
      const cleanFullName = formatTitleCaseTR(fullName);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: { full_name: cleanFullName } },
      });

      if (error) return { user: null, error };

      if (data.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          full_name: cleanFullName,
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

  /**
   * Supabase Google OAuth girişi — PKCE akışı
   *
   * Akış:
   *  1. Supabase'den OAuth başlatma URL'si al
   *  2. WebBrowser.openAuthSessionAsync ile Chrome Custom Tab'da aç
   *     - iOS: Otomatik redirect'i yakalayıp URL döner
   *     - Android: Custom Tab, exp:// deep link'e yönlenince Android intent tetiklenir
   *       → Expo Go ön plana gelir → App.tsx'teki maybeCompleteAuthSession() tamamlar
   *  3. Sonuç URL'inden code çıkar → exchangeCodeForSession çağır
   *  4. Fallback: App.tsx'teki Linking listener da aynı işi yapar
   */
  async signInWithGoogle(): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    try {
      const redirectUrl = makeRedirectUri({ path: 'auth/callback' });
      console.log('[Google OAuth] Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('[Google OAuth] signInWithOAuth error:', error.message);
        return { session: null, user: null, error };
      }

      if (!data?.url) {
        return { session: null, user: null, error: new Error('Google OAuth URL alınamadı') };
      }

      console.log('[Google OAuth] Opening browser:', data.url);

      // Chrome Custom Tab aç.
      // iOS → redirect URL'i yakaladığında otomatik kapatır.
      // Android → exp:// redirect'i Android intent olarak tetikler,
      //            Expo Go açılır, maybeCompleteAuthSession() session'ı tamamlar.
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      console.log('[Google OAuth] Browser result:', result.type);

      if (result.type === 'success' && result.url) {
        // openAuthSessionAsync doğrudan URL'i yakaladı (genellikle iOS'ta)
        console.log('[Google OAuth] Direct callback URL:', result.url);
        return this.handleCallbackUrl(result.url);
      }

      // Android'de tarayıcı kapatıldıysa (dismiss) veya bir şekilde kapandıysa,
      // App.tsx Linking listener zaten session oluşturmuş olabilir.
      // Kısa bekle ve session kontrol et.
      await new Promise((r) => setTimeout(r, 800));
      const { data: existing } = await supabase.auth.getSession();
      if (existing?.session) {
        console.log('[Google OAuth] Session found after browser close');
        return { session: existing.session, user: existing.session.user, error: null };
      }

      // Kullanıcı iptal etti
      return { session: null, user: null, error: null };
    } catch (err) {
      console.error('[Google OAuth] Error:', err);
      return {
        session: null,
        user: null,
        error: err instanceof Error ? err : new Error('Google ile giriş başarısız'),
      };
    }
  }

  async handleCallbackUrl(url: string): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');

      if (!code) {
        return { session: null, user: null, error: new Error('Callback URL\'de code parametresi bulunamadı') };
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return { session: null, user: null, error };

      await this.syncUserProfileFromAuth(data.user);
      return { session: data.session, user: data.user, error: null };
    } catch (err) {
      return { session: null, user: null, error: err instanceof Error ? err : new Error('Session oluşturulamadı') };
    }
  }

  async syncUserProfileFromAuth(user: User | null): Promise<{ error: Error | null }> {
    if (!user) return { error: null };
    try {
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Kullanıcı';
      const avatarUrl = meta.avatar_url || meta.picture || null;

      console.log('[AuthRepository] Syncing profile for user:', user.email, 'Avatar:', avatarUrl);

      const profileData: Partial<UserProfile> = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').upsert(profileData as any);
      if (error) console.error('[AuthRepository] Error syncing user profile:', error.message);
      return { error: error || null };
    } catch (err) {
      console.error('[AuthRepository] Exception syncing profile:', err);
      return { error: err instanceof Error ? err : new Error('Profile sync failed') };
    }
  }
}

export const authRepository = new AuthRepository();
