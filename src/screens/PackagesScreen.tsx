import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../store/auth.store';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { DEFAULT_CARRIERS, getCarrierByName } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { useTranslation } from '../hooks/useTranslation';

interface PackageItem {
  id: string;
  trackingNumber: string;
  companyName: string;
  companyLogo: string;
  status: 'transit' | 'delivered' | 'action_required';
  statusText: string;
  origin: string;
  destination: string;
  progress: number;
  deliveryDateLabel: string;
  deliveryDateValue: string;
  warningText?: string;
  createdAt: string;
}

const getInitialPackages = (t: any): PackageItem[] => [
  {
    id: '1',
    trackingNumber: 'KP8943271105',
    companyName: 'Global Express',
    companyLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQAYJqGOz9kirXFakdn6xML_KFwHoJ2AJzf-LABWag5ontXgnBPLXxI192uHGnjtuk1Hxtu-RPvkgWi0FBe9hxBGpkREvyF-yGAGETdnOiW_Anjj5uxVbdY_4bphH45OozbEFmwKUcPL_IUaiv_kQ9ytX8zYZN6Rjyf-niXHs8wnoifbWzkzkiNk9XR2LgbV4Wi156KAbDz5St-Hj_eU3BHdztDN5j4hzSUGx41fUlqY5txG6DkkVfv-TWr8LO_vNfc0oDWmNgiDY',
    status: 'transit',
    statusText: t('statusInTransit'),
    origin: 'SHZ',
    destination: 'BER',
    progress: 65,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: 'Eki 24, 2023',
    createdAt: '2023-10-20',
  },
  {
    id: '2',
    trackingNumber: 'TR1029384756',
    companyName: 'Yurtiçi Kargo',
    companyLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDndS9Xc59oX3WY735_crAmXQ57-GM1fOr2dpm7X82EOQi_wrJYw-pezBidOWHCa5k2Jy1QwtHqXyIABwy5DXMNneud1hVTvgLgVAXu0tIpyFM5yXixn4oLdsd9Tx8vvrITOEE58KWT8S-4-o6DUn-AZC0lkllVys5M0fxjZ5uZ5Ua6NrZA9PNoMvaOzlJcX2YxYivdZlnA8-We-T7hLcjvmmqA9xl7THZHNToHPMHiUGTg-sN5OTNsTIi5wCXOW9ahAtLQ_qb-4rk',
    status: 'delivered',
    statusText: t('statusDelivered'),
    origin: 'IST',
    destination: 'ANK',
    progress: 100,
    deliveryDateLabel: t('deliveredDateLabel'),
    deliveryDateValue: 'Eki 21, 2023',
    createdAt: '2023-10-18',
  },
  {
    id: '3',
    trackingNumber: 'DHL987654321',
    companyName: 'DHL Express',
    companyLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjM3WGmIKGRLjMW6IRU1kYHLqZV247A1R0k-tu002NXpTR9eBvCgJzSinfaCiyYFOL64rFF1bMhhEwZaJJxSkhUQPMWtaYISoFfhJliBKil7ol02FyEnBl2oBWRcxIwHPIpon6aPVYhSD6r7A3WpnmCQ3zsHhjl_muE97mWCTx9X9PyZ7C6jrUdCAkKaLg2jZ5e2XeWi3tgRJVO0bOJzm2jxXY9i2clZORqFEiiPJGldegt9z6hfKr4wZjrwqxlMY8QQev542fsWA',
    status: 'action_required',
    statusText: t('actionRequired'),
    origin: 'FRA',
    destination: 'IST',
    progress: 40,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: 'Beklemede',
    warningText: 'Gümrük onayı bekleniyor',
    createdAt: '2023-10-15',
  },
  {
    id: '4',
    trackingNumber: 'ARAS99283019',
    companyName: 'Aras Kargo',
    companyLogo: 'https://www.araskargo.com.tr/assets/images/aras-logo.svg',
    status: 'transit',
    statusText: t('statusInTransit'),
    origin: 'IZM',
    destination: 'BUR',
    progress: 85,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: 'Bugün',
    createdAt: '2023-10-22',
  },
  {
    id: '5',
    trackingNumber: 'PTT448201934',
    companyName: 'PTT Kargo',
    companyLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB1zSf7kxmY8C_5-etb0sfPsXQb5pwjtQED4ORcd9zL4fLFvWwBk5o-ZtMFKOWLnnuBL9d5u8r13hSJhClaZ0mSFpTQ59Gq70-Jiq9upSGmh5UYZShhSyJNk_DXxw_r6Om53_2I4sVreetCk3gbt3c1k6GAjVHZsSqwkBO028upnqYqIEEqeID6wXrURWDd1sUmpLL1grFDo3ckXKY3W_u3DCM1YCRLT-ZDAE_5g__b1r0HK1tEJgiAzZ-xGV1djAzx--hzv74yPo',
    status: 'delivered',
    statusText: t('statusDelivered'),
    origin: 'ANK',
    destination: 'TRB',
    progress: 100,
    deliveryDateLabel: t('deliveredDateLabel'),
    deliveryDateValue: 'Eki 19, 2023',
    createdAt: '2023-10-14',
  },
];

export const PackagesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { theme: colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { data: dbShipments } = useShipments(user?.id);
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // PanResponder for drag-down-to-dismiss gesture on sheetHandle
  const panY = useRef(new Animated.Value(600)).current;

  const closeFilterModal = () => {
    Animated.timing(panY, {
      toValue: 600,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setFilterModalVisible(false);
    });
  };

  const openFilterModal = () => {
    panY.setValue(600);
    setFilterModalVisible(true);
    Animated.spring(panY, {
      toValue: 0,
      damping: 24,
      mass: 0.8,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.4) {
          closeFilterModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            friction: 7,
            tension: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const CARRIER_OPTIONS = useMemo(() => [
    t('allFilter'),
    ...DEFAULT_CARRIERS.map(c => c.name)
  ], [t]);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'transit' | 'delivered' | 'action_required'>('all');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Combined packages list (from DB or fallback)
  const allPackages = useMemo<PackageItem[]>(() => {
    if (dbShipments && dbShipments.length > 0) {
      return dbShipments.map(s => ({
        id: s.id,
        trackingNumber: s.tracking_number,
        companyName: s.courier_companies?.name || s.title || 'Kargo',
        companyLogo: s.courier_companies?.logo_url || getCarrierByName(s.courier_companies?.name || s.title, s.tracking_number)?.logo,
        status: (s.current_status === 'delivered' ? 'delivered' : s.current_status === 'pending' ? 'action_required' : 'transit') as any,
        statusText: s.current_status === 'delivered' ? t('statusDelivered') : s.current_status === 'pending' ? t('statusPending') : t('statusInTransit'),
        origin: s.sender ? s.sender.substring(0, 3).toUpperCase() : 'TR',
        destination: s.receiver ? s.receiver.substring(0, 3).toUpperCase() : 'TR',
        progress: s.current_status === 'delivered' ? 100 : 65,
        deliveryDateLabel: s.current_status === 'delivered' ? t('deliveredDateLabel') : t('deliveryDateLabel'),
        deliveryDateValue: s.estimated_delivery || 'Yakında',
        createdAt: s.created_at || new Date().toISOString(),
      }));
    }
    return getInitialPackages(t);
  }, [dbShipments, t]);

  // Check if any filter is active
  const isFilterActive = statusFilter !== 'all' || carrierFilter !== 'Tümü' || sortBy !== 'newest';

  const resetFilters = () => {
    setStatusFilter('all');
    setCarrierFilter('Tümü');
    setSortBy('newest');
    setSearchQuery('');
  };

  // Filtered & Sorted Packages
  const filteredPackages = useMemo(() => {
    return allPackages
      .filter((pkg) => {
        // Search query match
        const matchesSearch =
          pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.companyName.toLowerCase().includes(searchQuery.toLowerCase());

        // Status match
        const matchesStatus =
          statusFilter === 'all' || pkg.status === statusFilter;

        // Carrier match
        const matchesCarrier =
          carrierFilter === 'Tümü' ||
          pkg.companyName.toLowerCase().includes(carrierFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesCarrier;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else {
          return a.companyName.localeCompare(b.companyName);
        }
      });
  }, [allPackages, searchQuery, statusFilter, carrierFilter, sortBy]);

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.outlineVariant + '40',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 30,
        paddingTop: insets.top,
      }]}>
        <View style={styles.appBarContent}>
          <Text style={[styles.appBarTitle, { flex: 1, color: colors.primary }]}>KargoTakip</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
        ]}
      >
        {/* Header & Search Area */}
        <View style={styles.headerSection}>
          <Text style={[isLargeScreen ? styles.pageTitleLarge : styles.pageTitle, { color: colors.primary }]}>
            {t('allPackagesTitle')}
          </Text>

          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIconLeft} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder={t('searchPlaceholderPackage')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity style={{ padding: 4 }} onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color={colors.outline} />
              </TouchableOpacity>
            ) : null}

            {/* Filter Trigger Button */}
            <TouchableOpacity
              style={[
                styles.searchIconRight,
                isFilterActive && { backgroundColor: colors.primaryContainer, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 6 }
              ]}
              onPress={openFilterModal}
              activeOpacity={0.8}
            >
              <View style={{ position: 'relative' }}>
                <MaterialIcons name="filter-list" size={22} color={isFilterActive ? colors.primary : colors.outline} />
                {isFilterActive && <View style={styles.activeFilterDot} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Active Filter Badges Row */}
          {isFilterActive && (
            <View style={styles.activeFilterChipsRow}>
              {statusFilter !== 'all' && (
                <View style={[styles.filterChip, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.filterChipText, { color: colors.primary }]}>
                    {statusFilter === 'transit' ? `🚚 ${t('statusInTransit')}` : statusFilter === 'delivered' ? `✅ ${t('statusDelivered')}` : `⚠️ ${t('statusPending')}`}
                  </Text>
                  <TouchableOpacity onPress={() => setStatusFilter('all')}>
                    <MaterialIcons name="close" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {carrierFilter !== 'Tümü' && (
                <View style={[styles.filterChip, { backgroundColor: colors.secondaryContainer }]}>
                  <Text style={[styles.filterChipText, { color: colors.secondary }]}>{carrierFilter}</Text>
                  <TouchableOpacity onPress={() => setCarrierFilter('Tümü')}>
                    <MaterialIcons name="close" size={14} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
              )}
              {sortBy !== 'newest' && (
                <View style={[styles.filterChip, { backgroundColor: colors.tertiaryContainer }]}>
                  <Text style={[styles.filterChipText, { color: colors.tertiary }]}>
                    {sortBy === 'oldest' ? 'Oldest' : 'A-Z'}
                  </Text>
                  <TouchableOpacity onPress={() => setSortBy('newest')}>
                    <MaterialIcons name="close" size={14} color={colors.tertiary} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={resetFilters} style={styles.resetFiltersBtn}>
                <Text style={{ fontSize: 12, color: colors.error, fontWeight: '600' }}>{t('filterClear')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Package List Grid */}
        {filteredPackages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color={colors.outline} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>{t('noPackagesFound')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
              {t('noPackagesFoundSub')}
            </Text>
            <TouchableOpacity style={[styles.resetButton, { backgroundColor: colors.primary }]} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>{t('filterClear')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.packageGrid}>
            {filteredPackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.cardDesktop]}
                onPress={() => navigation.navigate('PackageDetail', { shipmentId: pkg.id })}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.companyLogoBg, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                      <CarrierLogo
                        logo={pkg.companyLogo}
                        size={28}
                      />
                    </View>
                    <View>
                      <Text style={[styles.trackingNumber, { color: colors.onSurface }]}>{pkg.trackingNumber}</Text>
                      <Text style={[styles.companyName, { color: colors.onSurfaceVariant }]}>{pkg.companyName}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.badge,
                    pkg.status === 'delivered'
                      ? { backgroundColor: colors.tertiaryContainer, borderColor: colors.outlineVariant }
                      : pkg.status === 'action_required'
                        ? { backgroundColor: colors.errorContainer, borderColor: colors.outlineVariant }
                        : { backgroundColor: colors.secondaryContainer, borderColor: colors.outlineVariant }
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      pkg.status === 'delivered'
                        ? { color: colors.onTertiaryContainer }
                        : pkg.status === 'action_required'
                          ? { color: colors.onErrorContainer }
                          : { color: colors.onSurface }
                    ]}>{pkg.statusText}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.routeTextContainer}>
                    {pkg.warningText ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialIcons name="warning" size={16} color={colors.error} />
                        <Text style={[styles.routeText, { color: colors.error }]}>{pkg.warningText}</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={[styles.routeText, { color: colors.onSurfaceVariant }]}>{t('originLabel')}: {pkg.origin}</Text>
                        <Text style={[styles.routeText, { color: colors.onSurfaceVariant }]}>{t('destinationLabel')}: {pkg.destination}</Text>
                      </>
                    )}
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainer }]}>
                    <View style={[
                      styles.progressBarFill,
                      {
                        width: `${pkg.progress}%`,
                        backgroundColor: pkg.status === 'delivered' ? colors.tertiary : pkg.status === 'action_required' ? colors.error : colors.primary
                      }
                    ]} />
                  </View>
                </View>

                <View style={[styles.cardFooter, { borderTopColor: colors.outlineVariant }]}>
                  <View>
                    <Text style={[styles.footerLabel, { color: colors.outline }]}>{pkg.deliveryDateLabel}</Text>
                    <Text style={[styles.footerValuePrimary, { color: pkg.status === 'delivered' ? colors.onSurface : colors.primary }]}>
                      {pkg.deliveryDateValue}
                    </Text>
                  </View>
                  <View style={styles.footerAction}>
                    <Text style={[styles.footerActionText, { color: colors.primary }]}>{t('detailsBtn')}</Text>
                    <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Options Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFilterModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeFilterModal}
          />

          <Animated.View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surfaceContainerLowest, transform: [{ translateY: panY }] }
            ]}
          >
            {/* Sheet Handle with PanResponder Gesture */}
            <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="tune" size={22} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.primary }]}>{t('filterAndSortTitle')}</Text>
              </View>
              <TouchableOpacity onPress={closeFilterModal}>
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>

              {/* 1. Status Filter */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.onSurface }]}>{t('packageStatusFilterTitle')}</Text>
                <View style={styles.chipOptionsRow}>
                  {[
                    { id: 'all', label: t('allFilter') },
                    { id: 'transit', label: `🚚 ${t('statusInTransit')}` },
                    { id: 'delivered', label: `✅ ${t('statusDelivered')}` },
                    { id: 'action_required', label: `⚠️ ${t('actionRequired')}` },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chipOption,
                        { borderColor: colors.outlineVariant },
                        statusFilter === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setStatusFilter(item.id as any)}
                    >
                      <Text style={[
                        styles.chipOptionText,
                        { color: colors.onSurface },
                        statusFilter === item.id && { color: colors.onPrimary, fontWeight: '700' }
                      ]}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 2. Carrier Filter */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.onSurface }]}>{t('carrierLabel')}</Text>
                <View style={styles.chipOptionsRow}>
                  {CARRIER_OPTIONS.map((carrier) => (
                    <TouchableOpacity
                      key={carrier}
                      style={[
                        styles.chipOption,
                        { borderColor: colors.outlineVariant },
                        carrierFilter === carrier && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setCarrierFilter(carrier)}
                    >
                      <Text style={[
                        styles.chipOptionText,
                        { color: colors.onSurface },
                        carrierFilter === carrier && { color: colors.onPrimary, fontWeight: '700' }
                      ]}>{carrier}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 3. Sorting Criteria */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.onSurface }]}>{t('sortingTitle')}</Text>
                <View style={styles.chipOptionsRow}>
                  {[
                    { id: 'newest', label: `📅 ${t('sortNewest')}` },
                    { id: 'oldest', label: `📅 ${t('sortOldest')}` },
                    { id: 'name', label: `🔤 ${t('sortByName')}` },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chipOption,
                        { borderColor: colors.outlineVariant },
                        sortBy === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSortBy(item.id as any)}
                    >
                      <Text style={[
                        styles.chipOptionText,
                        { color: colors.onSurface },
                        sortBy === item.id && { color: colors.onPrimary, fontWeight: '700' }
                      ]}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </ScrollView>

            {/* Modal Actions Footer */}
            <View style={[styles.modalFooter, { borderTopColor: colors.outlineVariant }]}>
              <TouchableOpacity style={styles.modalResetBtn} onPress={resetFilters}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>{t('filterClear')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalApplyBtn, { backgroundColor: colors.primary }]}
                onPress={closeFilterModal}
              >
                <Text style={styles.modalApplyBtnText}>{t('applyFilters')} ({filteredPackages.length})</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingTop: 16,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    marginBottom: 24,
    gap: 16,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  pageTitleLarge: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    maxWidth: 672,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIconLeft: {
    paddingLeft: 12,
  },
  searchIconRight: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontFamily: 'Inter',
    fontSize: 14,
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  cardDesktop: {
    width: '48%',
    maxWidth: 400,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingRight: 8,
  },
  companyLogoBg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    width: 32,
    height: 32,
  },
  trackingNumber: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
  },
  companyName: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    gap: 8,
    marginBottom: 24,
  },
  routeTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  footerLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginBottom: 2,
  },
  footerValuePrimary: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    marginRight: -8,
  },
  footerActionText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  resolveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resolveButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
    zIndex: 40,
  },
  activeFilterDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  activeFilterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetFiltersBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  dragHandleArea: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
    gap: 24,
  },
  filterGroup: {
    gap: 10,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chipOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOptionText: {
    fontSize: 13,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  modalResetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalApplyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  modalApplyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PackagesScreen;
