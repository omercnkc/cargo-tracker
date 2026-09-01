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
import { useModalStore } from '../../store/modal.store';
import { UserAvatar } from './UserAvatar';
import { hapticService } from '../../services/haptics.service';
import { styles } from './DrawerMenuModal.styles';

export const DrawerMenuModal = () => {
  const { isOpen, closeDrawer } = useDrawerStore();
  const { theme: colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const { openAddressModal, openChangePasswordModal, openSupportModal, openCarrierModal, openPersonalInfoModal } = useModalStore();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('account');
  const displayEmail = user?.email || '';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const handleNavigate = (screenName: string) => {
    hapticService.buttonPress();
    closeDrawer();
    navigation.navigate(screenName);
  };

  const handleOpenPersonalInfoModal = () => {
    hapticService.buttonPress();
    closeDrawer();
    openPersonalInfoModal();
  };

  const handleOpenAddressModal = () => {
    hapticService.buttonPress();
    closeDrawer();
    openAddressModal();
  };

  const handleOpenChangePasswordModal = () => {
    hapticService.buttonPress();
    closeDrawer();
    openChangePasswordModal();
  };

  const handleOpenSupportModal = (type: any) => {
    hapticService.buttonPress();
    closeDrawer();
    openSupportModal(type);
  };

  const handleOpenCarrierModal = () => {
    hapticService.buttonPress();
    closeDrawer();
    openCarrierModal();
  };

  const handleLogout = () => {
    hapticService.warning();
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
              <MaterialIcons name="inventory-2" size={24} color={colors.primary} />
              <Text style={[styles.brandTitle, { color: colors.primary }]}>{t('appName')}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar & Info Centered */}
          <View style={styles.userProfileSection}>
            <UserAvatar
              avatarUrl={displayAvatar}
              name={displayName}
              email={displayEmail}
              size={64}
              borderWidth={2}
              borderColor={colors.surfaceContainer}
              style={{ marginBottom: 6 }}
            />
            <Text style={[styles.userName, { color: colors.onSurface }]}>{displayName}</Text>
            <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>{displayEmail}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScrollContent}>

            {/* HESAP SECTION */}
            <Text style={[styles.sectionHeaderTitle, { color: colors.onSurfaceVariant }]}>{t('accountHeader')}</Text>

            {/* 1. Kişisel Bilgiler */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleOpenPersonalInfoModal}
            >
              <MaterialIcons name="person-outline" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('personalInfo')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 2. Ayarlar */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleNavigate('Settings')}
            >
              <MaterialIcons name="settings" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('settings')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 3. Adreslerim */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleOpenAddressModal}
            >
              <MaterialIcons name="location-on" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('myAddresses')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 4. Bildirim Ayarları */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleNavigate('Notifications')}
            >
              <MaterialIcons name="notifications-none" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('notificationSettings')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 5. Varsayılan Kargo Firmaları */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleOpenCarrierModal}
            >
              <MaterialIcons name="local-shipping" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('defaultCarriersMenu')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: colors.outlineVariant }]} />

            {/* DESTEK SECTION */}
            <Text style={[styles.sectionHeaderTitle, { color: colors.onSurfaceVariant }]}>{t('supportHeader')}</Text>

            {/* 6. Yardım Merkezi */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleOpenSupportModal('help')}
            >
              <MaterialIcons name="help-outline" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('helpCenter')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 7. Uygulamayı Puanla */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleOpenSupportModal('rate')}
            >
              <MaterialIcons name="star-outline" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('rateApp')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 8. Geri Bildirim Gönder */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleOpenSupportModal('feedback')}
            >
              <MaterialIcons name="chat-bubble-outline" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('sendFeedback')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 9. Gizlilik Politikası */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleOpenSupportModal('privacy')}
            >
              <MaterialIcons name="shield" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('privacyPolicy')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* 10. Kullanım Koşulları */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleOpenSupportModal('terms')}
            >
              <MaterialIcons name="description" size={22} color={colors.onSurface} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>{t('termsOfUse')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>

            {/* Logout Pill Button */}
            <TouchableOpacity
              style={[styles.logoutPillBtn, { backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2' }]}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={colors.error} />
              <Text style={[styles.logoutPillText, { color: colors.error }]}>{t('signOut')}</Text>
            </TouchableOpacity>

          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

export default DrawerMenuModal;
