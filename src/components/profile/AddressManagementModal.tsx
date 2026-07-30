import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/useTheme';
import { AddAddressModal, UserAddress } from './AddAddressModal';

const ADDRESSES_STORAGE_KEY = '@cargo_tracker_user_addresses';

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 'addr_default_1',
    title: 'Ev Adresim',
    fullName: 'Ahmet Yılmaz',
    phone: '0555 123 45 67',
    city: 'İstanbul',
    district: 'Beşiktaş',
    fullAddress: 'Cihannüma Mah. Barbaros Bulvarı No:42 D:5, Beşiktaş / İstanbul',
    isDefault: true,
  },
  {
    id: 'addr_default_2',
    title: 'İş Yeri (Ofis)',
    fullName: 'Ahmet Yılmaz',
    phone: '0555 987 65 43',
    city: 'İstanbul',
    district: 'Levent',
    fullAddress: 'Büyükdere Cad. No:199 K:12, Levent / İstanbul',
  },
];

interface AddressManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddressManagementModal({ visible, onClose }: AddressManagementModalProps) {
  const { theme: colors } = useTheme();

  const [addresses, setAddresses] = useState<UserAddress[]>(DEFAULT_ADDRESSES);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAddresses();
    }
  }, [visible]);

  const loadAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Adresler yüklenemedi:', err);
    }
  };

  const handleSaveNewAddress = async (newAddress: UserAddress) => {
    const updated = [newAddress, ...addresses];
    setAddresses(updated);
    await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
    Alert.alert('Başarılı', 'Yeni adresiniz teslimat listenize eklendi.');
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Adresi Sil', 'Bu adresi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const updated = addresses.filter((a) => a.id !== id);
          setAddresses(updated);
          await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialIcons name="location-on" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>Adreslerim</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Add Address Action Button */}
          <TouchableOpacity
            style={[styles.addAddressBtn, { backgroundColor: colors.primary }]}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-location-alt" size={20} color="#ffffff" />
            <Text style={styles.addAddressBtnText}>Yeni Adres Ekle (GPS Destekli)</Text>
          </TouchableOpacity>

          {/* Addresses List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={48} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: colors.onSurface }]}>Kayıtlı adresiniz bulunmuyor</Text>
              </View>
            ) : (
              addresses.map((item) => (
                <View key={item.id} style={[styles.addressCard, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainer }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleBadgeRow}>
                      <Text style={[styles.cardTitle, { color: colors.primary }]}>{item.title}</Text>
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteAddress(item.id)} style={styles.deleteBtn}>
                      <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.addressBodyText, { color: colors.onSurface }]}>{item.fullAddress}</Text>

                  <View style={styles.cardFooterRow}>
                    <Text style={[styles.contactText, { color: colors.onSurfaceVariant }]}>
                      👤 {item.fullName} | 📞 {item.phone}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* GPS Supported Add Address Modal */}
      <AddAddressModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSaveAddress={handleSaveNewAddress}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  addAddressBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#1e40af',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  addressBodyText: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
  cardFooterRow: {
    marginTop: 6,
  },
  contactText: {
    fontSize: 12,
  },
});
