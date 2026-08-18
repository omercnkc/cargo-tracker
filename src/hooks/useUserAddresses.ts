import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAddress } from '../components/profile/AddAddressModal';

export const USER_ADDRESSES_STORAGE_KEY = '@cargo_tracker_user_addresses';

export const DEFAULT_ACTIVE_ADDRESS: UserAddress = {
  id: 'addr_default_1',
  title: 'Ev Adresim',
  fullName: 'Ahmet Yılmaz',
  phone: '0555 123 45 67',
  city: 'İstanbul',
  district: 'Beşiktaş',
  fullAddress: 'Cihannüma Mah. Barbaros Bulvarı No:42 D:5, Beşiktaş / İstanbul',
  latitude: 41.0425,
  longitude: 29.0068,
  isDefault: true,
};

export const useUserAddresses = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([DEFAULT_ACTIVE_ADDRESS]);
  const [loading, setLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      if (stored) {
        const list: UserAddress[] = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          setAddresses(list);
          return;
        }
      }
      setAddresses([DEFAULT_ACTIVE_ADDRESS]);
    } catch (e) {
      console.error('Error loading addresses in useUserAddresses:', e);
      setAddresses([DEFAULT_ACTIVE_ADDRESS]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || DEFAULT_ACTIVE_ADDRESS;

  return {
    addresses,
    defaultAddress,
    loading,
    refreshAddresses: loadAddresses,
  };
};
