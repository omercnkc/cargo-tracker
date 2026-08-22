import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';

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
import { FALLBACK_HOME_PACKAGES, DisplayPackage } from '../mock/fallbackPackages';
import { styles } from './HomeScreen.styles';

type HomeScreenNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNav>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { profile, user } = useAuthStore();
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const { data: dbShipments, isLoading: isShipmentsLoading } = useShipments(user?.id);

  const displayPackages: DisplayPackage[] = useMemo(() => {
    if (dbShipments && dbShipments.length > 0) {
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
    return FALLBACK_HOME_PACKAGES;
  }, [dbShipments]);

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
            navigation.navigate('AddPackage');
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
                const trackingPart = item.code?.includes('•') ? item.code.split('•')[1].trim() : item.code;
                navigation.navigate('PackageDetail', { 
                  id: item.id, 
                  shipmentId: item.id,
                  trackingNumber: trackingPart,
                  title: item.name,
                });
              }}
            />
          )}
        />
      )}
    </View>
  );
};

export default HomeScreen;
