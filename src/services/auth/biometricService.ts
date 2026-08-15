import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../../utils/logger';

const BIOMETRIC_ENABLED_KEY = 'cargo_tracker_biometric_enabled';
const LAST_ACTIVE_TIMESTAMP_KEY = 'cargo_tracker_last_active_timestamp';
export const BIOMETRIC_TIMEOUT_MS = 60 * 60 * 1000; // 60 dakika (ms)

export class BiometricService {
  /**
   * Cihazda biyometrik donanım desteği olup olmadığını kontrol eder (FaceID / Fingerprint)
   */
  static async isHardwareSupported(): Promise<boolean> {
    try {
      return await LocalAuthentication.hasHardwareAsync();
    } catch {
      return false;
    }
  }

  /**
   * Cihazda tanımlı kayıtlı biyometrik veri olup olmadığını kontrol eder
   */
  static async isEnrolled(): Promise<boolean> {
    try {
      return await LocalAuthentication.isEnrolledAsync();
    } catch {
      return false;
    }
  }

  /**
   * Biyometrik kimlik türünü döner (Face ID, Parmak İzi, Iris)
   */
  static async getBiometricTypes(): Promise<string[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const result: string[] = [];

      types.forEach((type) => {
        if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
          result.push('Face ID');
        } else if (type === LocalAuthentication.AuthenticationType.FINGERPRINT) {
          result.push('Parmak İzi (Touch ID)');
        } else if (type === LocalAuthentication.AuthenticationType.IRIS) {
          result.push('Göz Taraması (Iris)');
        }
      });

      return result.length > 0 ? result : ['Face ID / Parmak İzi'];
    } catch {
      return ['Face ID / Parmak İzi'];
    }
  }

  /**
   * Biyometrik doğrulama penceresini açar ve sonucu döner (Face ID / Touch ID)
   */
  static async authenticate(promptMessage: string = 'KargoTakip güvenli giriş için doğrulayın'): Promise<boolean> {
    try {
      const isSupported = await this.isHardwareSupported();
      const isEnrolled = await this.isEnrolled();

      if (!isSupported || !isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: 'Şifre İle Gir',
          cancelLabel: 'İptal',
          disableDeviceFallback: false,
        });
        return result.success;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Şifre İle Gir',
        cancelLabel: 'İptal',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      logger.warn('Biyometrik doğrulama iptal edildi veya başarısız oldu:', error);
      return false;
    }
  }

  /**
   * Kullanıcının biyometrik giriş tercihini saklar
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (err) {
      logger.warn('SecureStore yazma hatası:', err);
    }
  }

  /**
   * Biyometrik girişin aktif olup olmadığını kontrol eder
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Son aktif olunan zaman damgasını kaydeder/günceller
   */
  static async updateLastActiveTimestamp(): Promise<void> {
    try {
      await SecureStore.setItemAsync(LAST_ACTIVE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.error('Son aktif zaman damgası saklanamadı:', err);
    }
  }

  /**
   * 60 dakikalık inaktiflik süresinin dolup dolmadığını ve kilit gerekip gerekmediğini kontrol eder
   */
  static async shouldRequireLock(): Promise<boolean> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) return false;

      const val = await SecureStore.getItemAsync(LAST_ACTIVE_TIMESTAMP_KEY);
      if (!val) {
        // Timestamp henüz kaydedilmediyse kilit iste
        return true;
      }

      const lastActive = parseInt(val, 10);
      const elapsed = Date.now() - lastActive;

      // 60 dakika (3.600.000 ms) dolduysa kilit iste
      return elapsed >= BIOMETRIC_TIMEOUT_MS;
    } catch {
      return true;
    }
  }
}
