import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../store/auth.store';
import { useDrawerStore } from '../store/drawer.store';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { ProfileThemeLangSwitchCard } from '../components/profile/ProfileThemeLangSwitchCard';

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

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Ömer Çanakçı';
  const displayEmail = user?.email || 'omercnkc123@gmail.com';
  const displayAvatar = profile?.avatar_url || 'https://i.pravatar.cc/300?img=11';

  // Dynamic stats calculation
  const totalCount = dbShipments ? dbShipments.length : 5;
  const inTransitCount = dbShipments ? dbShipments.filter(s => s.current_status === 'transit').length : 5;
  const deliveredCount = dbShipments ? dbShipments.filter(s => s.current_status === 'delivered').length : 0;
  const errorCount = 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
            <MaterialIcons name="menu" size={24} color="#00236f" />
          </TouchableOpacity>
          
          <Text style={styles.appBarTitle}>KargoTakip</Text>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={{ position: 'relative' }}>
              <MaterialIcons name="notifications-none" size={24} color="#00236f" />
              <View style={styles.redDot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 48 : insets.bottom + 96 }
        ]}
      >
        {/* Profile Info Card (Centered Avatar, Name, Email, Edit Pill Button) */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <View style={styles.avatarBorderContainer}>
            <Image 
              source={{ uri: displayAvatar }}
              style={styles.avatarImage}
            />
          </View>
          
          <Text style={[styles.profileName, { color: colors.onSurface }]}>{displayName}</Text>
          <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>{displayEmail}</Text>

          <TouchableOpacity 
            style={styles.editPillButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="edit" size={16} color="#ffffff" />
            <Text style={styles.editPillButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Stats Row (4 Columns in 1 Row) */}
        <View style={[styles.statsCardRow, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          
          {/* Item 1: Toplam */}
          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: '#eff6ff' }]}>
              <MaterialIcons name="inventory-2" size={18} color="#2563eb" />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>Toplam</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{totalCount}</Text>
          </View>

          {/* Item 2: Yolda */}
          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: '#eff6ff' }]}>
              <MaterialIcons name="local-shipping" size={18} color="#2563eb" />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>Yolda</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{inTransitCount}</Text>
          </View>

          {/* Item 3: Teslim Edildi */}
          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: '#f0fdf4' }]}>
              <MaterialIcons name="check-circle" size={18} color="#16a34a" />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>Teslim Edildi</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{deliveredCount}</Text>
          </View>

          {/* Item 4: Sorunlu */}
          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: '#fef2f2' }]}>
              <MaterialIcons name="error" size={18} color="#dc2626" />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>Sorunlu</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{errorCount}</Text>
          </View>

        </View>

        {/* Theme & Language Switch Card */}
        <ProfileThemeLangSwitchCard />

      </ScrollView>
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
    color: '#00236f',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    maxWidth: 896,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarBorderContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginBottom: 20,
  },
  editPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00236f',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#00236f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  editPillButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsCardRow: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statColItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statColLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  statColValue: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default ProfileScreen;
