import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAddress } from '../components/profile/AddAddressModal';
import { useAuthStore } from '../store/auth.store';

export const USER_ADDRESSES_STORAGE_KEY = '@cargo_tracker_user_addresses';

export const DEFAULT_INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr_default_1',
    title: 'Ev Adresim',
    fullName: 'Kullanıcı',
    phone: '0555 123 45 67',
    city: 'İstanbul',
    district: 'Beşiktaş',
    fullAddress: 'Cihannüma Mah. Barbaros Bulvarı No:42 D:5, Beşiktaş / İstanbul',
    latitude: 41.0425,
    longitude: 29.0068,
    isDefault: true,
  },
  {
    id: 'addr_default_2',
    title: 'İş Yeri (Ofis)',
    fullName: 'Kullanıcı',
    phone: '0555 987 65 43',
    city: 'İstanbul',
    district: 'Levent',
    fullAddress: 'Büyükdere Cad. No:199 K:12, Levent / İstanbul',
    latitude: 41.0778,
    longitude: 29.0112,
    isDefault: false,
  },
];

export const DEFAULT_ACTIVE_ADDRESS = DEFAULT_INITIAL_ADDRESSES[0];

export const useUserAddresses = () => {
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const currentUserName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const initialAddresses = useMemo(() => {
    return DEFAULT_INITIAL_ADDRESSES.map(addr => ({
      ...addr,
      fullName: currentUserName || addr.fullName,
    }));
  }, [currentUserName]);

  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [loading, setLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      if (stored) {
        const list: UserAddress[] = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          // Normalize old hardcoded "Ahmet Yılmaz" with logged in user's name if available
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
      setAddresses(initialAddresses);
    } catch (e) {
      console.error('Error loading addresses in useUserAddresses:', e);
      setAddresses(initialAddresses);
    } finally {
      setLoading(false);
    }
  }, [currentUserName, initialAddresses]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const defaultAddress = useMemo(() => {
    const rawDefault = addresses.find((a) => a.isDefault) || addresses[0] || initialAddresses[0];
    if (currentUserName && (rawDefault.fullName === 'Ahmet Yılmaz' || rawDefault.fullName === 'Ahmet Yıldız' || !rawDefault.fullName)) {
      return { ...rawDefault, fullName: currentUserName };
    }
    return rawDefault;
  }, [addresses, currentUserName, initialAddresses]);

  return {
    addresses,
    defaultAddress,
    loading,
    refreshAddresses: loadAddresses,
  };
};
