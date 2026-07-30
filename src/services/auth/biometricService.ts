import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = '@cargo_tracker_biometric_enabled';

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
   * Biyometrik kimlik türünü döner (Face ID, Fingerprint, Iris)
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

      return result.length > 0 ? result : ['Biyometrik Kimlik'];
    } catch {
      return ['Biyometrik Kimlik'];
    }
  }

  /**
   * Biyometrik doğrulama penceresini açar ve sonucu döner
   */
  static async authenticate(promptMessage: string = 'KargoTakip güvenli giriş için doğrulayın'): Promise<boolean> {
    try {
      const isSupported = await this.isHardwareSupported();
      const isEnrolled = await this.isEnrolled();

      if (!isSupported || !isEnrolled) {
        console.warn('Biyometrik kimlik doğrulaması bu cihazda kullanılamıyor.');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Şifre İle Gir',
        cancelLabel: 'İptal',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biyometrik doğrulama hatası:', error);
      return false;
    }
  }

  /**
   * Kullanıcının biyometrik giriş tercihini saklar
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
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
}
