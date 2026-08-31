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

  // ─── Race condition koruması ───
  // Aynı PKCE code'unun birden fazla kez tüketilmesini önler.
  private _processedCodes = new Set<string>();
  // Eşzamanlı gelen callback'lerin aynı Promise'i beklemesini sağlar.
  private _inFlightExchange: Promise<{ session: Session | null; user: User | null; error: Error | null }> | null = null;

  /**
   * Supabase Google OAuth girişi — PKCE akışı
   *
   * Akış:
   *  1. Supabase'den OAuth başlatma URL'si al
   *  2. WebBrowser.openAuthSessionAsync ile tarayıcıda aç
   *  3. Dönen URL'i handleCallbackUrl ile güvenle işle (race condition korumalı)
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
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
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

      // Android'de önceki oturumdan kalan browser state'ini temizle
      await WebBrowser.warmUpAsync();

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      // Browser kaynağını serbest bırak (Android Custom Tab kalıntısını önler)
      await WebBrowser.coolDownAsync();

      console.log('[Google OAuth] Browser result:', result.type);

      if (result.type === 'success' && result.url) {
        console.log('[Google OAuth] Direct callback URL received:', result.url);
        return await this.handleCallbackUrl(result.url);
      }

      // Android'de deep link App.tsx Linking listener tarafından işlenmiş olabilir.
      // Kısa bir bekleme ve aktif session kontrolü yap.
      await new Promise((r) => setTimeout(r, 600));
      const { data: existing } = await supabase.auth.getSession();
      if (existing?.session) {
        console.log('[Google OAuth] Session resolved after browser close');
        return { session: existing.session, user: existing.session.user, error: null };
      }

      // Kullanıcı iptal etti veya oturum oluşmadı
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

  /**
   * Thread-safe & Idempotent OAuth Callback Handler
   *
   * WebBrowser ve App.tsx Linking listener aynı URL'i gönderse dahi
   * PKCE code sadece bir kez tüketilir. Eşzamanlı çağrılar aynı
   * Promise'i bekler.
   */
  async handleCallbackUrl(url: string): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    if (!url) return { session: null, user: null, error: null };

    // Eğer şu an çalışan bir exchange varsa, aynı Promise'i bekle
    if (this._inFlightExchange) {
      console.log('[OAuth Callback] Exchange already in-flight, awaiting existing promise...');
      return this._inFlightExchange;
    }

    this._inFlightExchange = this._executeCallbackExchange(url);

    try {
      return await this._inFlightExchange;
    } finally {
      this._inFlightExchange = null;
    }
  }

  private async _executeCallbackExchange(url: string): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    try {
      console.log('[OAuth Callback] Processing URL:', url);

      // 1. PKCE code parametresini güvenli regex ile çek
      const codeMatch = url.match(/[?&#]code=([^&]+)/);
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

      if (code) {
        // Aynı code daha önce işlendiyse, mevcut session'ı dön
        if (this._processedCodes.has(code)) {
          console.log('[OAuth Callback] Code already processed, returning existing session...');
          const { data: existing } = await supabase.auth.getSession();
          return { session: existing.session, user: existing.session?.user || null, error: null };
        }

        // Code'u işlenmiş olarak işaretle (5 dakika sonra temizle — bellek sızıntısı önleme)
        this._processedCodes.add(code);
        setTimeout(() => this._processedCodes.delete(code), 5 * 60 * 1000);

        console.log('[OAuth Callback] Exchanging code for session...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('[OAuth Callback] Code exchange error:', error.message);
          return { session: null, user: null, error };
        }

        if (data?.user) {
          await this.syncUserProfileFromAuth(data.user);
        }
        return { session: data.session, user: data.user, error: null };
      }

      // 2. Implicit akış fallback — hash fragment'taki access_token & refresh_token kontrolü
      const accessTokenMatch = url.match(/[?&#]access_token=([^&]+)/);
      const refreshTokenMatch = url.match(/[?&#]refresh_token=([^&]+)/);

      if (accessTokenMatch && refreshTokenMatch) {
        const access_token = decodeURIComponent(accessTokenMatch[1]);
        const refresh_token = decodeURIComponent(refreshTokenMatch[1]);

        console.log('[OAuth Callback] Setting session from token params...');
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.error('[OAuth Callback] setSession error:', error.message);
          return { session: null, user: null, error };
        }

        if (data?.user) {
          await this.syncUserProfileFromAuth(data.user);
        }
        return { session: data.session, user: data.user, error: null };
      }

      return { session: null, user: null, error: new Error('Callback URL geçerli bir oturum kodu veya token içermiyor') };
    } catch (err) {
      console.error('[OAuth Callback] Exception:', err);
      return {
        session: null,
        user: null,
        error: err instanceof Error ? err : new Error('Oturum doğrulanamadı'),
      };
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

      let { error } = await supabase.from('users').upsert(profileData as any);

      if (error && error.message?.includes('JWT issued at future')) {
        console.warn('[AuthRepository] Clock skew detected (JWT issued at future). Retrying profile sync in 1s...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const retryResult = await supabase.from('users').upsert(profileData as any);
        error = retryResult.error;
      }

      if (error) console.error('[AuthRepository] Error syncing user profile:', error.message);
      return { error: error || null };
    } catch (err) {
      console.error('[AuthRepository] Exception syncing profile:', err);
      return { error: err instanceof Error ? err : new Error('Profile sync failed') };
    }
  }
}

export const authRepository = new AuthRepository();

