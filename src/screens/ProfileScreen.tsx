import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../store/auth.store';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    await signOut();
    navigation.replace('Login');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const displayEmail = user?.email || 'ornek@email.com';
  const displayAvatar = profile?.avatar_url || 'https://i.pravatar.cc/300?img=11';

  return (
    <View style={[styles.container, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar (Desktop) / Mobile Header */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          {isLargeScreen ? (
            <>
              <View style={styles.headerLeft}>
                <Text style={styles.appBarTitle}>KargoTakip</Text>
              </View>
              <View style={styles.headerNav}>
                <Text style={styles.navLink}>Home</Text>
                <Text style={styles.navLink}>Packages</Text>
                <Text style={styles.navLink}>Stats</Text>
                <Text style={styles.navLinkActive}>Profile</Text>
              </View>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="notifications" size={24} color={colors.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="menu" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.appBarTitle}>KargoTakip</Text>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
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
        <View style={[styles.profileHeader, isLargeScreen && styles.profileHeaderDesktop]}>
          <View style={styles.decorativeBlur} />
          
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: displayAvatar }}
              style={styles.avatarImage}
            />
          </View>
          
          <View style={[styles.profileInfo, isLargeScreen && styles.profileInfoDesktop]}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.profileEmailRow}>
              <MaterialIcons name="mail" size={18} color={colors.onSurfaceVariant} />
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={16} color={colors.onPrimary} />
              <Text style={styles.editButtonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview Bento */}
        <View style={styles.statsGrid}>
          
          <View style={styles.statBox}>
            <View style={styles.statBoxHeader}>
              <Text style={styles.statBoxLabel}>TOPLAM</Text>
              <MaterialIcons name="inventory" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statBoxValue}>42</Text>
            <View style={styles.statBoxTrendRow}>
              <MaterialIcons name="trending-up" size={12} color={colors.tertiaryContainer} />
              <Text style={[styles.statBoxSubtext, { color: colors.tertiaryContainer }]}>+3 bu ay</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statBoxHeader}>
              <Text style={styles.statBoxLabel}>YOLDA</Text>
              <MaterialIcons name="local-shipping" size={20} color={colors.secondaryContainer} />
            </View>
            <Text style={styles.statBoxValue}>2</Text>
            <Text style={styles.statBoxSubtext}>Yakında teslim</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statBoxHeader}>
              <Text style={styles.statBoxLabel}>TESLİM EDİLDİ</Text>
              <MaterialIcons name="check-circle" size={20} color={colors.tertiaryContainer} />
            </View>
            <Text style={styles.statBoxValue}>38</Text>
            <Text style={styles.statBoxSubtext}>Başarıyla alındı</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statBoxHeader}>
              <Text style={styles.statBoxLabel}>SORUNLU</Text>
              <MaterialIcons name="error" size={20} color={colors.error} />
            </View>
            <Text style={styles.statBoxValue}>0</Text>
            <Text style={styles.statBoxSubtext}>Sorun yok</Text>
          </View>

        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          
          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Adreslerim</Text>
                <Text style={styles.settingsItemSubtitle}>Teslimat adreslerini yönet</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <MaterialIcons name="settings" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Hesap Ayarları</Text>
                <Text style={styles.settingsItemSubtitle}>Şifre, bildirimler, dil</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIconBg}>
                <MaterialIcons name="help" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Yardım Merkezi</Text>
                <Text style={styles.settingsItemSubtitle}>SSS ve müşteri desteği</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </TouchableOpacity>

        </View>

        {/* Logout Action */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    backgroundColor: colors.surface,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  headerNav: {
    flexDirection: 'row',
    gap: 24,
  },
  navLink: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navLinkActive: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16, // margin-mobile
    paddingTop: 32, // py-8
    maxWidth: 896, // max-w-4xl
    alignSelf: 'center',
    width: '100%',
    gap: 32,
  },
  profileHeader: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)', // outline-variant/30
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  profileHeaderDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  decorativeBlur: {
    position: 'absolute',
    top: -48,
    right: 0,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: colors.primaryFixed,
    opacity: 0.2,
    shadowColor: colors.primaryFixed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 0,
    zIndex: 0,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'center',
    zIndex: 10,
  },
  profileInfoDesktop: {
    alignItems: 'flex-start',
  },
  profileName: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
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
    color: colors.onSurfaceVariant,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  editButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%', // allow 2 columns on mobile
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    padding: 16,
    shadowColor: colors.primaryContainer,
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
    color: colors.onSurfaceVariant,
  },
  statBoxValue: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statBoxTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBoxSubtext: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  settingsList: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24, // container-padding
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingsIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsItemTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  settingsItemSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(197, 197, 211, 0.2)', // outline-variant/20
  },
  logoutContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.error,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant + '4D',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: 999,
  },
  navText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimaryContainer,
    marginTop: 4,
  },
});

export default ProfileScreen;
