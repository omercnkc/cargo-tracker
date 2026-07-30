import { useState, useEffect, useCallback } from 'react';
import { BiometricService } from '../services/auth/biometricService';

export function useBiometrics() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    setLoading(false);
  }, []);

  useEffect(() => {
    checkBiometricStatus();
  }, [checkBiometricStatus]);

  const toggleBiometric = async (value: boolean): Promise<boolean> => {
    if (value) {
      // Aktif etmeden önce cihaz üzerinde doğrulama iste
      const success = await BiometricService.authenticate('Biyometrik girişi aktifleştirmek için onaylayın');
      if (success) {
        await BiometricService.setBiometricEnabled(true);
        setIsEnabled(true);
        return true;
      }
      return false;
    } else {
      await BiometricService.setBiometricEnabled(false);
      setIsEnabled(false);
      return true;
    }
  };

  const authenticate = async (reason?: string): Promise<boolean> => {
    return BiometricService.authenticate(reason);
  };

  return {
    isSupported,
    isEnrolled,
    isEnabled,
    biometricTypes,
    loading,
    toggleBiometric,
    authenticate,
    refreshStatus: checkBiometricStatus,
  };
}
