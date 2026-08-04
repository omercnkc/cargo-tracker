import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import useResponsive from '../hooks/useResponsive';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAuthStore } from '../store/auth.store';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { useTranslation } from '../hooks/useTranslation';

export const StatisticsScreen = () => {
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { isOnline, pendingCount } = useNetworkStatus();
  const { theme: colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const { data: dbShipments, isLoading } = useShipments(user?.id);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  const shipments = useMemo(() => dbShipments || [], [dbShipments]);

  // Monthly Bar Chart Data (Last 6 Months)
  const monthlyBarData = useMemo(() => {
    const months: { month: string; value: number; year: number; monthIdx: number; key: string; fullLabel: string }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthShort = d.toLocaleDateString('tr-TR', { month: 'short' });
      const monthLong = d.toLocaleDateString('tr-TR', { month: 'long' });
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const key = `${year}-${monthIdx}`;

      months.push({
        month: monthShort.charAt(0).toUpperCase() + monthShort.slice(1),
        fullLabel: `${monthLong.charAt(0).toUpperCase() + monthLong.slice(1)} ${year}`,
        value: 0,
        year,
        monthIdx,
        key,
      });
    }

    shipments.forEach((s) => {
      if (s.created_at) {
        const date = new Date(s.created_at);
        const sYear = date.getFullYear();
        const sMonth = date.getMonth();
        const found = months.find((m) => m.year === sYear && m.monthIdx === sMonth);
        if (found) {
          found.value += 1;
        }
      }
    });

    const maxValue = Math.max(...months.map((m) => m.value), 1);

    return months.map((m) => ({
      ...m,
      height: `${Math.max(m.value > 0 ? (m.value / maxValue) * 100 : 8, 8)}%`,
      isSelected: selectedMonthKey === m.key,
    }));
  }, [shipments, selectedMonthKey]);

  // Selected Month Label
  const selectedMonthLabel = useMemo(() => {
    if (!selectedMonthKey) return null;
    const found = monthlyBarData.find((m) => m.key === selectedMonthKey);
    return found ? found.fullLabel : null;
  }, [selectedMonthKey, monthlyBarData]);

  // Filtered Shipments based on Selected Month
  const filteredShipments = useMemo(() => {
    if (!selectedMonthKey) return shipments;
    const [yearStr, monthStr] = selectedMonthKey.split('-');
    const targetYear = parseInt(yearStr, 10);
    const targetMonth = parseInt(monthStr, 10);

    return shipments.filter((s) => {
      if (!s.created_at) return false;
      const d = new Date(s.created_at);
      return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
    });
  }, [shipments, selectedMonthKey]);

  // KPI Calculations
  const totalCount = filteredShipments.length;

  const deliveredShipments = useMemo(() => {
    return filteredShipments.filter(
      (s) => s.delivered_at || s.current_status === 'delivered' || s.current_status === 'Teslim Edildi'
    );
  }, [filteredShipments]);

  const avgDeliveryDaysFormatted = useMemo(() => {
    let totalDays = 0;
    let validCount = 0;

    deliveredShipments.forEach((s) => {
      if (s.created_at && s.delivered_at) {
        const start = new Date(s.created_at).getTime();
        const end = new Date(s.delivered_at).getTime();
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0) {
          totalDays += diffDays;
          validCount++;
        }
      }
    });

    if (validCount === 0) return '0';
    return (totalDays / validCount).toFixed(1);
  }, [deliveredShipments]);

  const successRate = useMemo(() => {
    if (totalCount === 0) return '0';
    return ((deliveredShipments.length / totalCount) * 100).toFixed(1);
  }, [totalCount, deliveredShipments]);

  // Courier Company Distribution
  const courierStats = useMemo(() => {
    if (filteredShipments.length === 0) {
      return {
        totalCompanies: 0,
        breakdown: [],
      };
    }

    const map: Record<string, number> = {};
    filteredShipments.forEach((s) => {
      const companyName = s.courier_companies?.name || s.title || 'Diğer';
      map[companyName] = (map[companyName] || 0) + 1;
    });

    const total = filteredShipments.length;
    const chartColors = [colors.primary, colors.primaryContainer, colors.surfaceTint, colors.primaryFixed];

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);

    const breakdown = entries.map(([label, count], index) => {
      const pct = Math.round((count / total) * 100);
      return {
        label,
        count,
        pct: `%${pct}`,
        color: chartColors[index % chartColors.length],
      };
    });

    return {
      totalCompanies: entries.length,
      breakdown,
    };
  }, [filteredShipments, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.appBarContent}>
          <Text style={[styles.appBarTitle, { flex: 1, color: colors.primary }]}>Analiz & Raporlama</Text>
          
          {/* Network Status Badge */}
          <View style={[styles.networkBadge, { backgroundColor: isOnline ? (isDarkMode ? '#064e3b' : '#dcfce7') : (isDarkMode ? '#7f1d1d' : '#fee2e2') }]}>
            <MaterialIcons name={isOnline ? "wifi" : "wifi-off"} size={14} color={isOnline ? (isDarkMode ? '#6ee7b7' : '#166534') : (isDarkMode ? '#fca5a5' : '#991b1b')} />
            <Text style={[styles.networkBadgeText, { color: isOnline ? (isDarkMode ? '#6ee7b7' : '#166534') : (isDarkMode ? '#fca5a5' : '#991b1b') }]}>
              {isOnline ? 'Çevrimiçi' : `Çevrimdışı (${pendingCount} Bekleyen)`}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
        ]}
      >
        <View style={styles.pageHeaderRow}>
          <View style={styles.pageHeaderLeft}>
            <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Performans Özeti</Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
              {selectedMonthLabel ? `${selectedMonthLabel} verileri gösteriliyor` : 'Kargo teslimat ve istatistik raporlarınız'}
            </Text>
          </View>

          {/* Active Filter Chip */}
          {selectedMonthLabel && (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}
              onPress={() => setSelectedMonthKey(null)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="filter-list" size={14} color={colors.onPrimaryContainer} />
              <Text style={[styles.filterChipText, { color: colors.onPrimaryContainer }]}>
                {selectedMonthLabel}
              </Text>
              <MaterialIcons name="close" size={14} color={colors.onPrimaryContainer} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={[styles.bentoGrid, isLargeScreen && styles.bentoGridDesktop]}>
            {/* KPI Row */}
            <View style={[styles.kpiRow, isLargeScreen && styles.kpiRowDesktop]}>
              {/* Total Packages */}
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                <View style={styles.statCardHeader}>
                  <Text style={[styles.statCardLabel, { color: colors.onSurfaceVariant }]}>{t('totalCargo').toUpperCase()}</Text>
                  <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                    <MaterialIcons name="inventory" size={16} color={colors.onPrimaryContainer} />
                  </View>
                </View>
                <View>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{totalCount.toLocaleString()}</Text>
                  <View style={styles.trendRow}>
                    <Text style={[styles.trendTextNeutral, { color: colors.onSurfaceVariant }]}>
                      {selectedMonthLabel ? `${selectedMonthLabel}` : t('totalCargo')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Average Delivery Time */}
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                <View style={styles.statCardHeader}>
                  <Text style={[styles.statCardLabel, { color: colors.onSurfaceVariant }]}>{t('avgDeliveryTime').toUpperCase()}</Text>
                  <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name="timer" size={16} color={colors.primary} />
                  </View>
                </View>
                <View>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{avgDeliveryDaysFormatted} <Text style={[styles.statValueUnit, { color: colors.onSurfaceVariant }]}>Gün</Text></Text>
                  <View style={styles.trendRow}>
                    <Text style={[styles.trendTextNeutral, { color: colors.onSurfaceVariant }]}>{deliveredShipments.length} {t('statusDelivered').toLowerCase()}</Text>
                  </View>
                </View>
              </View>

              {/* Success Rate */}
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                <View style={styles.statCardHeader}>
                  <Text style={[styles.statCardLabel, { color: colors.onSurfaceVariant }]}>{t('deliverySuccess').toUpperCase()}</Text>
                  <View style={[styles.iconBox, { backgroundColor: colors.tertiaryContainer }]}>
                    <MaterialIcons name="check-circle" size={16} color={colors.onTertiaryContainer} />
                  </View>
                </View>
                <View>
                  <Text style={[styles.statValue, { color: colors.primary }]}>%{successRate}</Text>
                  <Text style={[styles.trendTextNeutral, { color: colors.onSurfaceVariant }]}>
                    {deliveredShipments.length} / {totalCount} {t('statusDelivered').toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Charts Row */}
            <View style={[styles.chartsRow, isLargeScreen && styles.chartsRowDesktop]}>
              {/* Bar Chart */}
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.barChartCardDesktop]}>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={[styles.chartTitle, { color: colors.onSurface }]}>{t('monthlyDistribution')}</Text>
                    <Text style={[styles.chartSubtitle, { color: colors.onSurfaceVariant }]}>Ay seçmek için sütunlara dokunun</Text>
                  </View>
                  {selectedMonthKey ? (
                    <TouchableOpacity
                      style={[styles.dropdownPicker, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.primary }]}
                      onPress={() => setSelectedMonthKey(null)}
                    >
                      <Text style={[styles.dropdownText, { color: colors.primary, fontWeight: '600' }]}>Tümünü Göster</Text>
                      <MaterialIcons name="close" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.dropdownPicker, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                      <Text style={[styles.dropdownText, { color: colors.onSurface }]}>Son 6 Ay</Text>
                    </View>
                  )}
                </View>

                <View style={[styles.barChartContainer, { borderBottomColor: colors.outlineVariant }]}>
                  <View style={styles.gridLines}>
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                  </View>

                  <View style={styles.barsArea}>
                    {monthlyBarData.map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={styles.barColumn}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedMonthKey((prev) => (prev === item.key ? null : item.key));
                        }}
                      >
                        <Text style={[
                          styles.barValueText, 
                          { 
                            color: item.isSelected ? colors.primary : colors.onSurfaceVariant, 
                            fontWeight: item.isSelected ? '700' : '600' 
                          }
                        ]}>
                          {item.value > 0 ? item.value : ''}
                        </Text>
                        <View style={styles.barTrack}>
                          <View style={[
                            styles.barFill, 
                            { 
                              height: item.height as any, 
                              backgroundColor: item.isSelected 
                                ? colors.primary 
                                : selectedMonthKey 
                                ? (isDarkMode ? '#374151' : '#e5e7eb') 
                                : colors.primaryContainer 
                            },
                          ]} />
                        </View>
                        <View style={[
                          styles.barLabelBadge,
                          item.isSelected && { backgroundColor: colors.primaryContainer }
                        ]}>
                          <Text style={[
                            styles.barLabel,
                            { color: item.isSelected ? colors.primary : colors.onSurfaceVariant },
                            item.isSelected && { fontWeight: '700' }
                          ]}>
                            {item.month}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Pie Chart (Simulated Donut) */}
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.pieChartCardDesktop]}>
                <Text style={[styles.chartTitle, { color: colors.onSurface }]}>Kargo Firması Oranları</Text>
                {selectedMonthLabel && (
                  <Text style={[styles.chartSubtitle, { color: colors.onSurfaceVariant }]}>{selectedMonthLabel}</Text>
                )}
                
                <View style={styles.donutChartContainer}>
                  <View style={[styles.donutOuter, { backgroundColor: colors.primaryContainer, borderColor: colors.primary, borderTopColor: colors.primaryFixed, borderRightColor: colors.surfaceTint }]}>
                    <View style={[styles.donutInner, { backgroundColor: colors.surfaceContainerLowest }]}>
                      <Text style={[styles.donutCenterText, { color: colors.onSurface }]}>{courierStats.totalCompanies}</Text>
                      <Text style={[styles.donutCenterSubtext, { color: colors.onSurfaceVariant }]}>Firma</Text>
                    </View>
                  </View>
                </View>

                {courierStats.breakdown.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                    {selectedMonthLabel ? `${selectedMonthLabel} için kargo kaydı yok.` : 'Henüz kayıtlı kargo bulunmuyor.'}
                  </Text>
                ) : (
                  <View style={styles.legendContainer}>
                    {courierStats.breakdown.map((item, i) => (
                      <View key={i} style={styles.legendRow}>
                        <View style={styles.legendLeft}>
                          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                          <Text style={[styles.legendLabel, { color: colors.onSurface }]}>{item.label}</Text>
                        </View>
                        <Text style={[styles.legendValue, { color: colors.onSurface }]}>{item.pct}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
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
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  networkBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  pageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageHeaderLeft: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoGrid: {
    gap: 16,
  },
  bentoGridDesktop: {
    gap: 16,
  },
  kpiRow: {
    flexDirection: 'column',
    gap: 16,
  },
  kpiRowDesktop: {
    flexDirection: 'row',
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    flex: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
  iconBox: {
    padding: 8,
    borderRadius: 999,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statValueUnit: {
    fontSize: 16,
    fontWeight: '400',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendTextNeutral: {
    fontFamily: 'Inter',
    fontSize: 13,
  },
  chartsRow: {
    flexDirection: 'column',
    gap: 16,
    marginTop: 8,
  },
  chartsRowDesktop: {
    flexDirection: 'row',
  },
  barChartCardDesktop: {
    flex: 2,
  },
  pieChartCardDesktop: {
    flex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
  },
  chartSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 2,
  },
  dropdownPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  dropdownText: {
    fontFamily: 'Inter',
    fontSize: 13,
  },
  barChartContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: 'space-between',
    zIndex: 0,
  },
  gridLine: {
    height: 1,
    opacity: 0.3,
  },
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    height: '100%',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: '10%',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  barLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  donutChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    minHeight: 160,
  },
  donutOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
  },
  donutCenterSubtext: {
    fontFamily: 'Inter',
    fontSize: 11,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 12,
    fontFamily: 'Inter',
    fontSize: 13,
  },
  legendContainer: {
    marginTop: 16,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
  },
  legendValue: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default StatisticsScreen;

