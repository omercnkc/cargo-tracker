import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import useResponsive from '../hooks/useResponsive';
import { PackageCard } from '../components/home/PackageCard';
import { StatCard } from '../components/home/StatCard';

import { useAuthStore } from '../store/auth.store';
import { useDrawerStore } from '../store/drawer.store';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { hapticService } from '../services/haptics.service';
import { resolveShipmentCarrier } from '../constants/carriers';

interface DisplayPackage {
  id: string;
  name: string;
  code: string;
  status: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const fallbackPackages: DisplayPackage[] = [
  { id: 'mock-1', name: 'Hepsiburada', code: 'HB782910234', status: 'created', icon: 'pending' },
  { id: 'mock-2', name: 'Trendyol Express', code: 'TY482019381', status: 'received', icon: 'inventory' },
  { id: 'mock-3', name: 'Aras Kargo', code: 'TR1234567890', status: 'transit', icon: 'local-shipping' },
  { id: 'mock-4', name: 'MNG Kargo', code: 'MN928301928', status: 'destination', icon: 'store' },
  { id: 'mock-5', name: 'Sürat Kargo', code: 'SK382910392', status: 'out_for_delivery', icon: 'local-shipping' },
  { id: 'mock-6', name: 'Yurtiçi Kargo', code: 'YK9876543210', status: 'delivered', icon: 'check-circle' },
];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { profile, user } = useAuthStore();
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const { data: dbShipments, isLoading: isShipmentsLoading } = useShipments(user?.id);

  const displayPackages: DisplayPackage[] = useMemo(() => {
    const isTestUser = user?.email?.toLowerCase() === 'omercnkc123@gmail.com';
    if (dbShipments && dbShipments.length > 0 && !isTestUser) {
      return dbShipments.map(s => {
        const carrier = resolveShipmentCarrier(s);
        const hasCustomTitle = s.title && s.title !== carrier.name;
        return {
          id: s.id,
          name: hasCustomTitle ? s.title! : carrier.name,
          code: hasCustomTitle ? `${carrier.name} • ${s.tracking_number}` : s.tracking_number,
          status: s.current_status || 'transit',
          icon: 'local-shipping' as keyof typeof MaterialIcons.glyphMap
        };
      });
    }
    return fallbackPackages;
  }, [dbShipments, user]);

  const stats = useMemo(() => {
    const delivered = displayPackages.filter(p => p.status === 'delivered').length;
    const pending = displayPackages.filter(p => p.status === 'pending').length;
    const transit = displayPackages.filter(p => p.status === 'transit').length;
    return { delivered, pending, transit };
  }, [displayPackages]);

  const renderHeader = useMemo(() => (
    <View>
      {/* Welcome Section */}
      <View style={styles.section}>
        <Text style={[isLargeScreen ? styles.welcomeTitleLarge : styles.welcomeTitle, { color: colors.primary }]}>
          {t('welcome')}, {profile?.full_name?.split(' ')[0] || 'Kullanıcı'}!
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.onSurfaceVariant }]}>{t('welcomeSubtitle')}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label={t('delivered')} value={stats.delivered} icon="check-circle" variant="small" />
        <StatCard label={t('pending')} value={stats.pending} icon="pending" variant="small" />
        <StatCard label={t('inTransit')} value={stats.transit} icon="local-shipping" variant="large" isLargeScreen={isLargeScreen} />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity 
          style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]} 
          activeOpacity={0.8}
          onPress={() => {
            hapticService.buttonPress();
            navigation.navigate('MainTabs', { screen: 'AddPackage' });
          }}
        >
          <MaterialIcons name="add-box" size={24} color={colors.onPrimary} />
          <Text style={[styles.primaryActionText, { color: colors.onPrimary }]}>{t('addPackage')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceContainer, borderColor: colors.primaryFixed }]} 
          activeOpacity={0.8}
          onPress={() => {
            hapticService.buttonPress();
            navigation.navigate('Scanner');
          }}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color={colors.primary} />
          <Text style={[styles.secondaryActionText, { color: colors.primary }]}>{t('qrScan')}</Text>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{t('recentPackages')}</Text>
        <TouchableOpacity onPress={() => {
          hapticService.buttonPress();
          navigation.navigate('Search');
        }}>
          <Text style={[styles.seeAllLink, { color: colors.primary }]}>{t('seeAll')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [isLargeScreen, navigation, profile, stats, colors, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.surfaceContainer }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            hapticService.buttonPress();
            openDrawer();
          }}>
            <MaterialIcons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('appName')}</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {isShipmentsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayPackages.slice(0, 3)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.mainContent, 
            { paddingBottom: isLargeScreen ? 24 : insets.bottom + 80 }
          ]}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <PackageCard 
              id={item.id}
              name={item.name}
              code={item.code}
              status={item.status}
              icon={item.icon}
              isLargeScreen={isLargeScreen}
              onPress={() => {
                hapticService.buttonPress();
                navigation.navigate('PackageDetail', { id: item.id });
              }}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
    borderBottomWidth: 1,
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
    paddingVertical: 24,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeTitleLarge: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllLink: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;
