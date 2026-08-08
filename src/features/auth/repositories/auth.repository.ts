import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Linking, AppState } from 'react-native';
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

  async signInWithGoogle(): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    try {
      const isExpoGo = Constants.executionEnvironment === 'storeClient';
      const rawScheme = Constants.expoConfig?.scheme;
      const scheme = Array.isArray(rawScheme) ? rawScheme[0] : rawScheme || 'cargotracker';

      const redirectUrl = makeRedirectUri({
        scheme: isExpoGo ? undefined : scheme,
        path: 'auth/callback',
      });

      console.log("=========================================");
      console.log("[OAuth Debug] Calculated Redirect URL:", redirectUrl);
      console.log("[OAuth Debug] Configured Scheme:", scheme);
      console.log("[OAuth Debug] Is Expo Go:", isExpoGo);
      console.log("=========================================");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      console.log("data.url:", data?.url);

      if (error) return { session: null, user: null, error };
      if (!data?.url) return { session: null, user: null, error: new Error('Google OAuth bağlantısı oluşturulamadı') };

      let subscription: any = null;
      let appStateSubscription: any = null;

      const linkPromise = new Promise<string>((resolve) => {
        subscription = Linking.addEventListener('url', (event) => {
          console.log("========== LINKING EVENT ==========");
          console.log("[OAuth Debug] Deep link caught by listener:", event.url);
          console.log("===================================");
          if (event.url) {
            WebBrowser.dismissBrowser();
            resolve(event.url);
          }
        });

        appStateSubscription = AppState.addEventListener('change', async (nextState) => {
          if (nextState === 'active') {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl && (initialUrl.includes('code=') || initialUrl.includes('access_token='))) {
              console.log("========== APP STATE RESUME ==========");
              console.log("[OAuth Debug] Auth URL found on app resume:", initialUrl);
              console.log("======================================");
              WebBrowser.dismissBrowser();
              resolve(initialUrl);
            }
          }
        });
      });

      const browserPromise = WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
        showInRecents: true,
        createTask: false,
      }).then((res) => {
        console.log("========== AUTH RESULT ==========");
        console.log("Auth Result:", JSON.stringify(res, null, 2));
        console.log("=================================");
        if (res.type === 'success' && res.url) {
          return res.url;
        }
        return null;
      });

      const redirectResultUrl = await Promise.race([browserPromise, linkPromise]);

      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
      if (appStateSubscription && typeof appStateSubscription.remove === 'function') {
        appStateSubscription.remove();
      }

      console.log("[OAuth Debug] Final Redirect Result URL:", redirectResultUrl);

      if (!redirectResultUrl) {
        return { session: null, user: null, error: null };
      }

      return await this.createSessionFromUrl(redirectResultUrl);
    } catch (err) {
      return { session: null, user: null, error: err instanceof Error ? err : new Error('Google ile giriş başarısız') };
    }
  }

  private async createSessionFromUrl(url: string): Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    try {
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let code: string | null = null;

      // Extract parameters from hash (#) if present
      if (url.includes('#')) {
        const hashString = url.split('#')[1];
        const hashParams = new URLSearchParams(hashString);
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        code = hashParams.get('code');
      }

      // Extract parameters from query (?) if present
      if (url.includes('?')) {
        const queryString = url.split('?')[1]?.split('#')[0];
        const queryParams = new URLSearchParams(queryString);
        if (!accessToken) accessToken = queryParams.get('access_token');
        if (!refreshToken) refreshToken = queryParams.get('refresh_token');
        if (!code) code = queryParams.get('code');
      }

      let session: Session | null = null;
      let user: User | null = null;

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) return { session: null, user: null, error };
        session = data.session;
        user = data.user;
      } else if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return { session: null, user: null, error };
        session = data.session;
        user = data.user;
      } else {
        return { session: null, user: null, error: new Error('Yönlendirme bağlantısından geçerli doğrulama bilgisi alınamadı') };
      }

      if (user) {
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Kullanıcı';
        const avatarUrl = meta.avatar_url || meta.picture || null;

        const profileData: Partial<UserProfile> = {
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        };

        await supabase.from('users').upsert(profileData as any);
      }

      return { session, user, error: null };
    } catch (err) {
      return { session: null, user: null, error: err instanceof Error ? err : new Error('Oturum oluşturma başarısız') };
    }
  }
}

export const authRepository = new AuthRepository();
