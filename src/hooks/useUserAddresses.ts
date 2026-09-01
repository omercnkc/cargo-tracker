import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAddress } from '../components/profile/AddAddressModal';
import { useAuthStore } from '../store/auth.store';

export const USER_ADDRESSES_STORAGE_KEY = '@cargo_tracker_user_addresses';

export const DEFAULT_INITIAL_ADDRESSES: UserAddress[] = [];

export const DEFAULT_ACTIVE_ADDRESS: UserAddress | null = null;

export const useUserAddresses = () => {
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const currentUserName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      if (stored) {
        const list: UserAddress[] = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          // Normalize old hardcoded placeholder names with logged in user's name if available
          const normalized = list.map(addr => {
            if (currentUserName && (addr.fullName === 'Ahmet Yılmaz' || addr.fullName === 'Ahmet Yıldız' || !addr.fullName)) {
              return { ...addr, fullName: currentUserName };
            }
            return addr;
          });
          setAddresses(normalized);
          return;
        }
      }
      setAddresses([]);
    } catch (e) {
      console.error('Error loading addresses in useUserAddresses:', e);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserName]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const defaultAddress = useMemo(() => {
    if (addresses.length === 0) return null;
    const rawDefault = addresses.find((a) => a.isDefault) || addresses[0];
    if (currentUserName && (rawDefault.fullName === 'Ahmet Yılmaz' || rawDefault.fullName === 'Ahmet Yıldız' || !rawDefault.fullName)) {
      return { ...rawDefault, fullName: currentUserName };
    }
    return rawDefault;
  }, [addresses, currentUserName]);

  return {
    addresses,
    defaultAddress,
    loading,
    refreshAddresses: loadAddresses,
  };
};
