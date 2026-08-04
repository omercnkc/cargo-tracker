import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_ACCESS_TOKEN_KEY = 'cargo_tracker_google_access_token';
const GOOGLE_USER_INFO_KEY = '@cargo_tracker_google_user_info';

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export class GoogleAuthService {
  /**
   * Google Access Token'ı güvenli depoya kaydeder
   */
  static async saveAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(GOOGLE_ACCESS_TOKEN_KEY, token);
    } catch {
      // Fallback
      await AsyncStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token);
    }
  }

  /**
   * Saklanan Google Access Token'ı getirir
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      let token = await SecureStore.getItemAsync(GOOGLE_ACCESS_TOKEN_KEY);
      if (!token) {
        token = await AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
      }
      return token;
    } catch {
      return null;
    }
  }

  /**
   * Kullanıcı profil bilgilerini kaydeder
   */
  static async saveUserProfile(profile: GoogleUserProfile): Promise<void> {
    await AsyncStorage.setItem(GOOGLE_USER_INFO_KEY, JSON.stringify(profile));
  }

  /**
   * Kayıtlı Google profil bilgilerini getirir
   */
  static async getUserProfile(): Promise<GoogleUserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(GOOGLE_USER_INFO_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Google Access Token kullanarak kullanıcı profil detaylarını Google API'den çeker
   */
  static async fetchUserProfileFromGoogle(accessToken: string): Promise<GoogleUserProfile | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    } catch (err) {
      console.error('Google profile fetch error:', err);
      return null;
    }
  }

  /**
   * Google bağlantısını tamamen keser ve kaydedilmiş jetonları siler
   */
  static async disconnect(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(GOOGLE_ACCESS_TOKEN_KEY);
    } catch {}
    await AsyncStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(GOOGLE_USER_INFO_KEY);
  }
}
