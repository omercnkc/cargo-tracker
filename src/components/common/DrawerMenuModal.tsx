import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Image, 
  Alert,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useDrawerStore } from '../../store/drawer.store';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { AddressManagementModal } from '../profile/AddressManagementModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { SupportHelpModal, SupportModalType } from './SupportHelpModal';

export const DrawerMenuModal = () => {
  const { isOpen, closeDrawer } = useDrawerStore();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const [addressesModalVisible, setAddressesModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [supportModalState, setSupportModalState] = useState<{ visible: boolean; type: SupportModalType }>({
    visible: false,
    type: 'help',
  });

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Ömer Çanakçı';
  const displayEmail = user?.email || 'omercnkc123@gmail.com';
  const displayAvatar = profile?.avatar_url || 'https://i.pravatar.cc/300?img=11';

  const handleNavigate = (screenName: string) => {
    closeDrawer();
    navigation.navigate(screenName);
  };

  const openSupportModal = (type: SupportModalType) => {
    closeDrawer();
    setSupportModalState({ visible: true, type });
  };

  const handleLogout = () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('signOut'), 
          style: 'destructive',
          onPress: async () => {
            closeDrawer();
            await signOut();
          }
        }
      ]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <View style={styles.overlay}>
          {/* Backdrop Tap to Close */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Drawer Body */}
          <View style={[
            styles.drawerContainer, 
            { backgroundColor: colors.surfaceContainerLowest, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }
          ]}>
            
            {/* Top Brand & Close Header */}
            <View style={styles.topBrandRow}>
              <View style={styles.brandGroup}>
                <MaterialIcons name="inventory-2" size={24} color="#00236f" />
                <Text style={styles.brandTitle}>KargoTakip</Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar & Info Centered */}
            <View style={styles.userProfileSection}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              </View>
              <Text style={[styles.userName, { color: colors.onSurface }]}>{displayName}</Text>
              <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>{displayEmail}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScrollContent}>
              
              {/* HESAP SECTION */}
              <Text style={styles.sectionHeaderTitle}>HESAP</Text>
              
              {/* 1. Kişisel Bilgiler */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => handleNavigate('Settings')}
              >
                <MaterialIcons name="person-outline" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Kişisel Bilgiler</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 2. Adreslerim */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer();
                  setAddressesModalVisible(true);
                }}
              >
                <MaterialIcons name="location-on" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Adreslerim</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 3. Şifre Değiştir */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer();
                  setChangePasswordModalVisible(true);
                }}
              >
                <MaterialIcons name="lock-outline" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Şifre Değiştir</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 4. Bildirim Ayarları */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => handleNavigate('Notifications')}
              >
                <MaterialIcons name="notifications-none" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Bildirim Ayarları</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 5. Varsayılan Kargo Firmaları */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => handleNavigate('CarrierSelection')}
              >
                <MaterialIcons name="local-shipping" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Varsayılan Kargo Firmaları</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* DESTEK SECTION */}
              <Text style={styles.sectionHeaderTitle}>DESTEK</Text>

              {/* 6. Yardım Merkezi */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => openSupportModal('help')}
              >
                <MaterialIcons name="help-outline" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Yardım Merkezi</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 7. Uygulamayı Puanla */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => openSupportModal('rate')}
              >
                <MaterialIcons name="star-outline" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Uygulamayı Puanla</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 8. Geri Bildirim Gönder */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => openSupportModal('feedback')}
              >
                <MaterialIcons name="chat-bubble-outline" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Geri Bildirim Gönder</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 9. Gizlilik Politikası */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => openSupportModal('privacy')}
              >
                <MaterialIcons name="shield" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Gizlilik Politikası</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* 10. Kullanım Koşulları */}
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => openSupportModal('terms')}
              >
                <MaterialIcons name="description" size={22} color={colors.onSurface} />
                <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Kullanım Koşulları</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              {/* Logout Pill Button */}
              <TouchableOpacity style={styles.logoutPillBtn} activeOpacity={0.8} onPress={handleLogout}>
                <MaterialIcons name="logout" size={20} color="#dc2626" />
                <Text style={styles.logoutPillText}>{t('signOut')}</Text>
              </TouchableOpacity>

            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Address Management Modal */}
      <AddressManagementModal
        visible={addressesModalVisible}
        onClose={() => setAddressesModalVisible(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
      />

      {/* Support & Legal Help Modal */}
      <SupportHelpModal
        visible={supportModalState.visible}
        type={supportModalState.type}
        onClose={() => setSupportModalState({ ...supportModalState, visible: false })}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
  },
  drawerContainer: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 24,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00236f',
    fontFamily: 'Inter',
  },
  closeBtn: {
    padding: 4,
  },
  userProfileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Inter',
  },
  menuScrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  logoutPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  logoutPillText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

export default DrawerMenuModal;
