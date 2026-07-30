import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../store/auth.store';
import { useDrawerStore } from '../store/drawer.store';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useShipments } from '../features/shipment/hooks/useShipments';
import HeaderRightActions from '../components/common/HeaderRightActions';
import { AddAddressModal, UserAddress } from '../components/profile/AddAddressModal';

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

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const openDrawer = useDrawerStore((state) => state.openDrawer);

  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { data: dbShipments } = useShipments(user?.id);

  const [addresses, setAddresses] = useState<UserAddress[]>(DEFAULT_ADDRESSES);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  useEffect(() => {
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
    loadAddresses();
  }, []);

  const handleSaveAddress = async (newAddress: UserAddress) => {
    const updated = [newAddress, ...addresses];
    setAddresses(updated);
    await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
    Alert.alert('Başarılı', 'Yeni adresiniz kaydedildi.');
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

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const displayEmail = user?.email || 'ornek@email.com';
  const displayAvatar = profile?.avatar_url || 'https://i.pravatar.cc/300?img=11';

  // Dynamic stats calculation
  const totalCount = dbShipments ? dbShipments.length : 42;
  const inTransitCount = dbShipments ? dbShipments.filter(s => s.current_status === 'transit').length : 2;
  const deliveredCount = dbShipments ? dbShipments.filter(s => s.current_status === 'delivered').length : 38;
  const errorCount = 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
            <MaterialIcons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('appName')}</Text>
          <HeaderRightActions />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 48 : insets.bottom + 96 }
        ]}
      >
        {/* Profile Header Card */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surfaceContainerLowest }, isLargeScreen && styles.profileHeaderDesktop]}>
          <View style={[styles.avatarContainer, { borderColor: colors.surfaceContainerLowest }]}>
            <Image 
              source={{ uri: displayAvatar }}
              style={styles.avatarImage}
            />
          </View>
          
          <View style={[styles.profileInfo, isLargeScreen && styles.profileInfoDesktop]}>
            <Text style={[styles.profileName, { color: colors.onSurface }]}>{displayName}</Text>
            <View style={styles.profileEmailRow}>
              <MaterialIcons name="mail" size={18} color={colors.onSurfaceVariant} />
              <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>{displayEmail}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: colors.primary }]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings')}
            >
              <MaterialIcons name="edit" size={16} color={colors.onPrimary} />
              <Text style={[styles.editButtonText, { color: colors.onPrimary }]}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview Bento */}
        <View style={styles.statsGrid}>
          
          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statBoxLabel, { color: colors.onSurfaceVariant }]}>TOPLAM</Text>
              <MaterialIcons name="inventory" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statBoxValue, { color: colors.onSurface }]}>{totalCount}</Text>
            <View style={styles.statBoxTrendRow}>
              <MaterialIcons name="trending-up" size={12} color={colors.tertiaryContainer} />
              <Text style={[styles.statBoxSubtext, { color: colors.tertiaryContainer }]}>Güncel</Text>
            </View>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statBoxLabel, { color: colors.onSurfaceVariant }]}>YOLDA</Text>
              <MaterialIcons name="local-shipping" size={20} color={colors.secondaryContainer} />
            </View>
            <Text style={[styles.statBoxValue, { color: colors.onSurface }]}>{inTransitCount}</Text>
            <Text style={[styles.statBoxSubtext, { color: colors.onSurfaceVariant }]}>Yakında teslim</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statBoxLabel, { color: colors.onSurfaceVariant }]}>TESLİM EDİLDİ</Text>
              <MaterialIcons name="check-circle" size={20} color={colors.tertiaryContainer} />
            </View>
            <Text style={[styles.statBoxValue, { color: colors.onSurface }]}>{deliveredCount}</Text>
            <Text style={[styles.statBoxSubtext, { color: colors.onSurfaceVariant }]}>Başarıyla alındı</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statBoxLabel, { color: colors.onSurfaceVariant }]}>SORUNLU</Text>
              <MaterialIcons name="error" size={20} color={colors.error} />
            </View>
            <Text style={[styles.statBoxValue, { color: colors.onSurface }]}>{errorCount}</Text>
            <Text style={[styles.statBoxSubtext, { color: colors.onSurfaceVariant }]}>Sorun yok</Text>
          </View>

        </View>

        {/* Adreslerim (My Addresses) Section */}
        <View style={[styles.addressSectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={styles.addressSectionHeader}>
            <View style={styles.addressTitleRow}>
              <MaterialIcons name="location-on" size={22} color={colors.primary} />
              <Text style={[styles.addressSectionTitle, { color: colors.onSurface }]}>Adreslerim</Text>
            </View>

            <TouchableOpacity
              style={[styles.addAddressBtn, { backgroundColor: colors.primary }]}
              onPress={() => setAddressModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={18} color="#ffffff" />
              <Text style={styles.addAddressBtnText}>Adres Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Address Cards List */}
          <View style={styles.addressListContainer}>
            {addresses.map((item) => (
              <View key={item.id} style={[styles.addressCard, { borderColor: colors.outlineVariant }]}>
                <View style={styles.addressCardHeader}>
                  <View style={styles.addressCardBadgeRow}>
                    <Text style={[styles.addressCardTitle, { color: colors.primary }]}>{item.title}</Text>
                    {item.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAddress(item.id)} style={styles.deleteAddressBtn}>
                    <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.addressText, { color: colors.onSurface }]}>{item.fullAddress}</Text>

                <View style={styles.addressContactRow}>
                  <Text style={[styles.addressContactText, { color: colors.onSurfaceVariant }]}>
                    👤 {item.fullName} | 📞 {item.phone}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Add Address Modal with GPS Support */}
      <AddAddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSaveAddress={handleSaveAddress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 40,
  },
  appBarContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    maxWidth: 896,
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  profileHeader: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  profileHeaderDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'center',
  },
  profileInfoDesktop: {
    alignItems: 'flex-start',
  },
  profileName: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
  },
  profileEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  profileEmail: {
    fontFamily: 'Inter',
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  editButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    gap: 8,
  },
  statBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBoxLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  statBoxValue: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
  },
  statBoxTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBoxSubtext: {
    fontFamily: 'Inter',
    fontSize: 12,
  },
  addressSectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addressSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addAddressBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  addressListContainer: {
    gap: 12,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressCardTitle: {
    fontSize: 15,
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
  deleteAddressBtn: {
    padding: 4,
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
  addressContactRow: {
    marginTop: 4,
  },
  addressContactText: {
    fontSize: 12,
  },
});

export default ProfileScreen;
