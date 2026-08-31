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
import { DEFAULT_CARRIERS, getCarrierByName, resolveShipmentCarrier } from '../constants/carriers';
import { getShipmentProgress } from '../utils/shipmentUtils';
import { formatDateDDMMYYYY, formatDateWithMonthName } from '../utils/dateUtils';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { useTranslation } from '../hooks/useTranslation';
import { CargoStatusTracker } from '../components/common/CargoStatusTracker';
import { hapticService } from '../services/haptics.service';
import { styles } from './PackagesScreen.styles';

interface PackageItem {
  id: string;
  trackingNumber: string;
  customTitle?: string | null;
  companyName: string;
  companyLogo: any;
  status: string;
  statusText: string;
  titleKey?: string;
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
    id: 'mock-1',
    trackingNumber: 'TY7382910482',
    customTitle: 'Kablosuz Kulaklık & Koruma Kılıfı',
    companyName: 'Trendyol Express',
    companyLogo: getCarrierByName('trendyol')?.logo,
    status: 'out_for_delivery',
    statusText: t('stepOutForDelivery'),
    titleKey: 'stepOutForDelivery',
    origin: 'İZM',
    destination: 'İST',
    progress: 80,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: 'Bugün, 14:00 - 18:00',
    createdAt: '2026-08-17',
  },
  {
    id: 'mock-2',
    trackingNumber: 'HJ9482019384',
    customTitle: 'Mekanik Oyuncu Klavyesi',
    companyName: 'Hepsijet',
    companyLogo: getCarrierByName('hepsijet')?.logo,
    status: 'transit',
    statusText: t('stepTransit'),
    titleKey: 'stepTransit',
    origin: 'ANK',
    destination: 'İST',
    progress: 40,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: 'Yarın, 10:00 - 14:00',
    createdAt: '2026-08-16',
  },
  {
    id: 'mock-3',
    trackingNumber: 'YK8473920194',
    customTitle: 'Deri Sırt Çantası & Cüzdan',
    companyName: 'Yurtiçi Kargo',
    companyLogo: getCarrierByName('yurtici')?.logo,
    status: 'destination',
    statusText: t('stepDestination'),
    titleKey: 'stepDestination',
    origin: 'BUR',
    destination: 'İZM',
    progress: 60,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: 'Bugün Dağıtım Bekliyor',
    createdAt: '2026-08-15',
  },
  {
    id: 'mock-4',
    trackingNumber: 'AR2948103947',
    customTitle: 'Koşu Ayakkabısı (42 Numara)',
    companyName: 'Aras Kargo',
    companyLogo: getCarrierByName('aras')?.logo,
    status: 'delivered',
    statusText: t('stepDelivered'),
    titleKey: 'stepDelivered',
    origin: 'İST',
    destination: 'ANK',
    progress: 100,
    deliveryDateLabel: t('deliveredDateLabel'),
    deliveryDateValue: 'Dün, 16:30',
    createdAt: '2026-08-14',
  },
  {
    id: 'mock-5',
    trackingNumber: 'SK1928374650',
    customTitle: 'Yazılım & Tasarım Kitapları',
    companyName: 'Sürat Kargo',
    companyLogo: getCarrierByName('surat')?.logo,
    status: 'created',
    statusText: t('stepCreated'),
    titleKey: 'stepCreated',
    origin: 'ANK',
    destination: 'İZM',
    progress: 0,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: 'Sipariş Hazırlanıyor',
    createdAt: '2026-08-18',
  },
  {
    id: 'mock-6',
    trackingNumber: 'KG8392019381',
    customTitle: 'Filtre Kahve Çekirdeği 1KG',
    companyName: 'Kargoist',
    companyLogo: getCarrierByName('kargoist')?.logo,
    status: 'received',
    statusText: t('stepReceived'),
    titleKey: 'stepReceived',
    origin: 'İST',
    destination: 'ANT',
    progress: 20,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: '2 Gün İçinde',
    createdAt: '2026-08-17',
  },
  {
    id: 'mock-7',
    trackingNumber: 'DHL9382019283',
    customTitle: 'Yurt Dışı Yazılım Geliştirici Kiti',
    companyName: 'DHL Express',
    companyLogo: getCarrierByName('dhl')?.logo,
    status: 'transit',
    statusText: t('stepTransit'),
    titleKey: 'stepTransit',
    origin: 'FRA',
    destination: 'İST',
    progress: 50,
    deliveryDateLabel: t('deliveryDateLabel'),
    deliveryDateValue: '3 Gün İçinde (Gümrük Geçildi)',
    createdAt: '2026-08-16',
  },
  {
    id: 'mock-8',
    trackingNumber: 'FDX0928374619',
    customTitle: 'Akıllı Ev Sensör Paketi',
    companyName: 'FedEx',
    companyLogo: getCarrierByName('fedex')?.logo,
    status: 'delivered',
    statusText: t('stepDelivered'),
    titleKey: 'stepDelivered',
    origin: 'AMS',
    destination: 'İST',
    progress: 100,
    deliveryDateLabel: t('deliveredDateLabel'),
    deliveryDateValue: '3 Gün Önce Teslim Edildi',
    createdAt: '2026-08-13',
  },
];

export const PackagesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { theme: colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { data: dbShipments } = useShipments(user?.id);
  const { t, language } = useTranslation();

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

  // Pagination State (5 items per page)
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Combined packages list (from DB or fallback)
  const allPackages = useMemo<PackageItem[]>(() => {
    const mockList = getInitialPackages(t);

    if (dbShipments && dbShipments.length > 0) {
      const dbItems: PackageItem[] = dbShipments.map(s => {
        const rawStatus = s.current_status || 'transit';
        const progressInfo = getShipmentProgress(rawStatus);
        const carrierInfo = resolveShipmentCarrier(s);
        const isCustomTitle = s.title && s.title !== carrierInfo.name;
        let deliveryDateVal = s.estimated_delivery || (language === 'en' ? 'Soon' : 'Yakında');
        if (s.delivered_at) {
          deliveryDateVal = formatDateDDMMYYYY(s.delivered_at);
        } else if (s.estimated_delivery && s.estimated_delivery.includes('-') && !isNaN(Date.parse(s.estimated_delivery))) {
          deliveryDateVal = formatDateDDMMYYYY(s.estimated_delivery);
        }

        return {
          id: s.id,
          trackingNumber: s.tracking_number,
          customTitle: isCustomTitle ? s.title : null,
          companyName: carrierInfo.name,
          companyLogo: carrierInfo.logo,
          status: rawStatus as any,
          statusText: t(progressInfo.titleKey as any) || progressInfo.stepTitle,
          titleKey: progressInfo.titleKey,
          origin: s.sender ? s.sender.substring(0, 3).toUpperCase() : 'TR',
          destination: s.receiver ? s.receiver.substring(0, 3).toUpperCase() : 'TR',
          progress: progressInfo.progressPercent,
          deliveryDateLabel: rawStatus === 'delivered' ? t('deliveredDateLabel') : t('deliveryDateLabel'),
          deliveryDateValue: deliveryDateVal,
          createdAt: s.created_at || new Date().toISOString(),
        };
      });

      return dbItems;
    }
    return mockList;
  }, [dbShipments, t, language]);

  // Check if any filter is active
  const isCarrierFiltered = carrierFilter !== 'all' && carrierFilter !== 'Tümü' && carrierFilter !== CARRIER_OPTIONS[0];
  const isFilterActive = statusFilter !== 'all' || isCarrierFiltered || sortBy !== 'newest';

  const resetFilters = () => {
    setStatusFilter('all');
    setCarrierFilter('all');
    setSortBy('newest');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filtered & Sorted Packages
  const filteredPackages = useMemo(() => {
    return allPackages
      .filter((pkg) => {
        // Search query match
        const matchesSearch =
          pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (pkg.customTitle && pkg.customTitle.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status match
        const matchesStatus =
          statusFilter === 'all' ||
          pkg.status === statusFilter ||
          (statusFilter === 'transit' && ['transit', 'destination', 'out_for_delivery', 'received', 'in_transit'].includes(pkg.status)) ||
          (statusFilter === 'delivered' && ['delivered', 'teslim_edildi'].includes(pkg.status)) ||
          (statusFilter === 'action_required' && ['action_required', 'pending', 'created'].includes(pkg.status));

        // Carrier match
        const matchesCarrier =
          !isCarrierFiltered ||
          pkg.companyName.toLowerCase().includes(carrierFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesCarrier;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else {
          const nameA = a.customTitle || a.companyName;
          const nameB = b.customTitle || b.companyName;
          return nameA.localeCompare(nameB);
        }
      });
  }, [allPackages, searchQuery, statusFilter, carrierFilter, isCarrierFiltered, sortBy]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredPackages.length / ITEMS_PER_PAGE) || 1;
  }, [filteredPackages.length]);

  // Latency Methodology / Lazy Slicing: Only render items for the active page
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

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
          <Text style={[styles.appBarTitle, { flex: 1, color: colors.primary }]}>{t('appName')}</Text>
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
                isFilterActive && [styles.filterBtnActive, { backgroundColor: colors.primary }]
              ]}
              onPress={() => {
                hapticService.buttonPress();
                openFilterModal();
              }}
              activeOpacity={0.8}
            >
              <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="filter-list" size={22} color={isFilterActive ? colors.onPrimary : colors.outline} />
                {isFilterActive && <View style={styles.activeFilterDot} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Active Filter Badges Row */}
          {isFilterActive && (
            <View style={styles.activeFilterChipsRow}>
              {statusFilter !== 'all' && (
                <View style={[styles.filterChip, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.filterChipText, { color: colors.onPrimary }]}>
                    {statusFilter === 'transit' ? `🚚 ${t('statusInTransit')}` : statusFilter === 'delivered' ? `✅ ${t('statusDelivered')}` : `⚠️ ${t('statusPending')}`}
                  </Text>
                  <TouchableOpacity onPress={() => {
                    hapticService.selection();
                    setStatusFilter('all');
                  }}>
                    <MaterialIcons name="close" size={14} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              )}
              {isCarrierFiltered && (
                <View style={[styles.filterChip, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.filterChipText, { color: colors.onPrimary }]}>{carrierFilter}</Text>
                  <TouchableOpacity onPress={() => {
                    hapticService.selection();
                    setCarrierFilter('all');
                  }}>
                    <MaterialIcons name="close" size={14} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              )}
              {sortBy !== 'newest' && (
                <View style={[styles.filterChip, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.filterChipText, { color: colors.onPrimary }]}>
                    {sortBy === 'oldest' ? 'Oldest' : 'A-Z'}
                  </Text>
                  <TouchableOpacity onPress={() => {
                    hapticService.selection();
                    setSortBy('newest');
                  }}>
                    <MaterialIcons name="close" size={14} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={() => {
                hapticService.selection();
                resetFilters();
              }} style={styles.resetFiltersBtn}>
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
            <TouchableOpacity style={[styles.resetButton, { backgroundColor: colors.primary }]} onPress={() => {
              hapticService.selection();
              resetFilters();
            }}>
              <Text style={styles.resetButtonText}>{t('filterClear')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: '100%' }}>
            <View style={styles.packageGrid}>
              {paginatedPackages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.cardDesktop]}
                  onPress={() => {
                    hapticService.buttonPress();
                    navigation.navigate('PackageDetail', {
                      id: pkg.id,
                      shipmentId: pkg.id,
                      trackingNumber: pkg.trackingNumber,
                      title: pkg.customTitle || undefined,
                      companyName: pkg.companyName,
                      package: pkg,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.companyLogoBg, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                        <CarrierLogo
                          logo={pkg.companyLogo}
                          size={24}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        {pkg.customTitle ? (
                          <>
                            <Text style={[styles.trackingNumber, { color: colors.onSurface }]} numberOfLines={1}>
                              {pkg.customTitle}
                            </Text>
                            <Text style={[styles.companyName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                              {pkg.companyName} • {pkg.trackingNumber}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text style={[styles.trackingNumber, { color: colors.onSurface }]} numberOfLines={1}>
                              {pkg.trackingNumber}
                            </Text>
                            <Text style={[styles.companyName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                              {pkg.companyName}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    {(() => {
                      const isDelivered = pkg.status === 'delivered' || pkg.status === 'teslim_edildi';
                      const isActionReq = pkg.status === 'action_required' || pkg.status === 'failed';
                      const isPending = pkg.status === 'created' || pkg.status === 'pending';

                      const badgeBg = isDelivered
                        ? (colors.status?.delivered?.background || '#DCFCE7')
                        : isActionReq
                          ? (colors.status?.alert?.background || '#FEE2E2')
                          : isPending
                            ? (colors.status?.pending?.background || '#EFF4FF')
                            : (colors.status?.inTransit?.background || '#FFEDD5');

                      const badgeColor = isDelivered
                        ? (colors.status?.delivered?.text || '#166534')
                        : isActionReq
                          ? (colors.status?.alert?.text || '#991B1B')
                          : isPending
                            ? (colors.status?.pending?.text || '#1E3A8A')
                            : (colors.status?.inTransit?.text || '#9A3412');

                      return (
                        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                          <Text style={[styles.badgeText, { color: badgeColor }]}>
                            {pkg.titleKey ? (t(pkg.titleKey as any) || pkg.statusText) : pkg.statusText}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>

                  <View style={styles.progressSection}>
                    {pkg.warningText && (
                      <View style={[styles.routeTextContainer, { marginBottom: 8 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialIcons name="warning" size={16} color={colors.error} />
                          <Text style={[styles.routeText, { color: colors.error }]}>{pkg.warningText}</Text>
                        </View>
                      </View>
                    )}
                    <CargoStatusTracker
                      status={pkg.status}
                      compact={!isLargeScreen}
                      showLabels={isLargeScreen}
                    />
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View>
                <View style={[styles.paginationWrapper, { borderTopColor: colors.outlineVariant }]}>
                  {/* Previous Page Button */}
                  <TouchableOpacity
                    style={[
                      styles.paginationBtn,
                      { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
                      currentPage === 1 && styles.paginationBtnDisabled,
                    ]}
                    disabled={currentPage === 1}
                    onPress={() => {
                      hapticService.selection();
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="chevron-left" size={20} color={currentPage === 1 ? colors.outline : colors.primary} />
                    <Text style={[styles.paginationBtnText, { color: currentPage === 1 ? colors.outline : colors.primary }]}>
                      {t('previous') || 'Önceki'}
                    </Text>
                  </TouchableOpacity>

                  {/* Page Numbers */}
                  <View style={styles.paginationPagesRow}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      return (
                        <TouchableOpacity
                          key={pageNum}
                          style={[
                            styles.paginationPagePill,
                            {
                              backgroundColor: isActive ? colors.primary : colors.surfaceContainerLowest,
                              borderColor: isActive ? colors.primary : colors.outlineVariant,
                            },
                          ]}
                          onPress={() => {
                            hapticService.selection();
                            setCurrentPage(pageNum);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.paginationPagePillText,
                              { color: isActive ? colors.onPrimary : colors.onSurface },
                            ]}
                          >
                            {pageNum}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Next Page Button */}
                  <TouchableOpacity
                    style={[
                      styles.paginationBtn,
                      { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
                      currentPage === totalPages && styles.paginationBtnDisabled,
                    ]}
                    disabled={currentPage === totalPages}
                    onPress={() => {
                      hapticService.selection();
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.paginationBtnText, { color: currentPage === totalPages ? colors.outline : colors.primary }]}>
                      {t('next') || 'Sonraki'}
                    </Text>
                    <MaterialIcons name="chevron-right" size={20} color={currentPage === totalPages ? colors.outline : colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Sub-info text */}
                <Text style={[styles.paginationInfoText, { color: colors.onSurfaceVariant }]}>
                  {`${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredPackages.length)} / ${filteredPackages.length} ${t('showingShipments')}`}
                </Text>
              </View>
            )}
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
                  {CARRIER_OPTIONS.map((carrier) => {
                    const isSelected = carrierFilter === carrier || (!isCarrierFiltered && carrier === CARRIER_OPTIONS[0]);
                    return (
                      <TouchableOpacity
                        key={carrier}
                        style={[
                          styles.chipOption,
                          { borderColor: colors.outlineVariant },
                          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setCarrierFilter(carrier)}
                      >
                        <Text style={[
                          styles.chipOptionText,
                          { color: colors.onSurface },
                          isSelected && { color: colors.onPrimary, fontWeight: '700' }
                        ]}>{carrier}</Text>
                      </TouchableOpacity>
                    );
                  })}
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

export default PackagesScreen;
