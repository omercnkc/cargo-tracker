import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { BiometricService } from '../services/auth/biometricService';

export function useBiometrics() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const appState = useRef(AppState.currentState);

  const checkBiometricStatus = useCallback(async () => {
    setLoading(true);
    const supported = await BiometricService.isHardwareSupported();
    const enrolled = await BiometricService.isEnrolled();
    const enabled = await BiometricService.isBiometricEnabled();
    const types = await BiometricService.getBiometricTypes();

    setIsSupported(supported);
    setIsEnrolled(enrolled);
    setIsEnabled(enabled);
    setBiometricTypes(types);

    // Biyometrik kilit aktif ise 60 dakika inaktiflik süresinin dolup dolmadığını kontrol et
    if (enabled) {
      const shouldLock = await BiometricService.shouldRequireLock();
      setIsLocked(shouldLock);
    } else {
      setIsLocked(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkBiometricStatus();
  }, [checkBiometricStatus]);

  // Arka plana geçiş ve dönüşlerde 60 dakika kontrolü
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // Uygulama arka plana/inaktif duruma geçtiğinde son zaman damgasını kaydet
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        await BiometricService.updateLastActiveTimestamp();
      }

      // Uygulama tekrar ön plana geçtiğinde 60 dk dolduysa kilit ekranını getir
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const enabled = await BiometricService.isBiometricEnabled();
        if (enabled) {
          const shouldLock = await BiometricService.shouldRequireLock();
          if (shouldLock) {
            setIsLocked(true);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const toggleBiometric = useCallback(async (value: boolean): Promise<boolean> => {
    if (value) {
      // Aktif etmeden önce cihaz üzerinde doğrulama iste
      const success = await BiometricService.authenticate('Biyometrik girişi aktifleştirmek için onaylayın');
      if (success) {
        await BiometricService.setBiometricEnabled(true);
        await BiometricService.updateLastActiveTimestamp();
        setIsEnabled(true);
        return true;
      }
      return false;
    } else {
      await BiometricService.setBiometricEnabled(false);
      setIsEnabled(false);
      setIsLocked(false);
      return true;
    }
  }, []);

  const unlockApp = useCallback(async (): Promise<boolean> => {
    const success = await BiometricService.authenticate('KargoTakip kilitli. Lütfen kimliğinizi doğrulayın.');
    if (success) {
      await BiometricService.updateLastActiveTimestamp();
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  return {
    isSupported,
    isEnrolled,
    isEnabled,
    isLocked,
    biometricTypes,
    loading,
    toggleBiometric,
    unlockApp,
    refreshStatus: checkBiometricStatus,
  };
}
