import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Image, 
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useDrawerStore } from '../../store/drawer.store';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

export const DrawerMenuModal = () => {
  const { isOpen, closeDrawer } = useDrawerStore();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const displayEmail = user?.email || 'ornek@email.com';
  const displayAvatar = profile?.avatar_url || 'https://i.pravatar.cc/300?img=11';

  const handleNavigate = (screenName: string) => {
    closeDrawer();
    navigation.navigate(screenName);
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
          { backgroundColor: colors.surfaceContainerLowest, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }
        ]}>
          
          {/* Header User Profile Card */}
          <View style={styles.header}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.onSurface }]}>{displayName}</Text>
              <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>{displayEmail}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          {/* Menu Items */}
          <View style={styles.menuList}>
            {/* Adreslerim */}
            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => {
                closeDrawer();
                Alert.alert('Adreslerim', 'Teslimat adres yönetimi yakında eklenecektir.');
              }}
            >
              <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextGroup}>
                <Text style={[styles.menuTitle, { color: colors.onSurface }]}>Adreslerim</Text>
                <Text style={[styles.menuSubtitle, { color: colors.onSurfaceVariant }]}>Teslimat adreslerini yönet</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
            </TouchableOpacity>

            {/* Hesap Ayarları */}
            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => handleNavigate('Settings')}
            >
              <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="settings" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextGroup}>
                <Text style={[styles.menuTitle, { color: colors.onSurface }]}>Hesap Ayarları</Text>
                <Text style={[styles.menuSubtitle, { color: colors.onSurfaceVariant }]}>Şifre, bildirimler, dil</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
            </TouchableOpacity>

            {/* Yardım Merkezi */}
            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => {
                closeDrawer();
                Alert.alert('Yardım Merkezi', 'Müşteri desteği 7/24 hizmetinizdedir.');
              }}
            >
              <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="help-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextGroup}>
                <Text style={[styles.menuTitle, { color: colors.onSurface }]}>Yardım Merkezi</Text>
                <Text style={[styles.menuSubtitle, { color: colors.onSurfaceVariant }]}>SSS ve müşteri desteği</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
            </TouchableOpacity>
          </View>

          {/* Footer Logout */}
          <View style={styles.footer}>
            <View style={[styles.divider, { backgroundColor: colors.outlineVariant, marginBottom: 16 }]} />
            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
              <MaterialIcons name="logout" size={22} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>{t('signOut')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 28, 48, 0.5)',
  },
  drawerContainer: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#e5eeff',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.4,
  },
  menuList: {
    flex: 1,
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    paddingTop: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DrawerMenuModal;
