import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { G, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import useResponsive from '../hooks/useResponsive';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAuthStore } from '../store/auth.store';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { useTranslation } from '../hooks/useTranslation';
import { useStatisticsAnalytics } from '../hooks/useStatisticsAnalytics';
import { hapticService } from '../services/haptics.service';
import { styles } from './StatisticsScreen.styles';

export const StatisticsScreen = () => {
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { isOnline, pendingCount } = useNetworkStatus();
  const { theme: colors, isDarkMode } = useTheme();
  const { t, language } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const { data: dbShipments, isLoading } = useShipments(user?.id);

  const barScrollRef = useRef<ScrollView>(null);

  const {
    selectedMonthKey,
    setSelectedMonthKey,
    selectedMonthLabel,
    monthlyBarData,
    totalCount,
    deliveredCount,
    avgDeliveryDaysFormatted,
    successRate,
    courierStats,
  } = useStatisticsAnalytics(dbShipments, language);

  // Auto scroll to latest month on mobile
  useEffect(() => {
    if (!isLargeScreen) {
      setTimeout(() => {
        barScrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [isLargeScreen]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.appBarContent}>
          <Text style={[styles.appBarTitle, { flex: 1, color: colors.primary }]}>{t('analyticsAndReporting')}</Text>

          {/* Network Status Badge */}
          <View style={[styles.networkBadge, { backgroundColor: isOnline ? (isDarkMode ? '#064e3b' : '#dcfce7') : (isDarkMode ? '#7f1d1d' : '#fee2e2') }]}>
            <MaterialIcons name={isOnline ? "wifi" : "wifi-off"} size={14} color={isOnline ? (isDarkMode ? '#6ee7b7' : '#166534') : (isDarkMode ? '#fca5a5' : '#991b1b')} />
            <Text style={[styles.networkBadgeText, { color: isOnline ? (isDarkMode ? '#6ee7b7' : '#166534') : (isDarkMode ? '#fca5a5' : '#991b1b') }]}>
              {isOnline ? t('online') : `${t('offline')} (${pendingCount})`}
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
            <Text style={[styles.pageTitle, { color: colors.primary }]}>{t('performanceSummary')}</Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
              {selectedMonthLabel ? `${selectedMonthLabel}` : t('statsOverviewSubtitle')}
            </Text>
          </View>

          {/* Active Filter Chip */}
          {selectedMonthLabel && (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setSelectedMonthKey(null)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="filter-list" size={14} color={colors.onPrimary} />
              <Text style={[styles.filterChipText, { color: colors.onPrimary }]}>
                {selectedMonthLabel}
              </Text>
              <MaterialIcons name="close" size={14} color={colors.onPrimary} />
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
                    <Text style={[styles.trendTextNeutral, { color: colors.onSurfaceVariant }]}>{deliveredCount} {t('statusDelivered').toLowerCase()}</Text>
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
                    {deliveredCount} / {totalCount} {t('statusDelivered').toLowerCase()}
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
                    <Text style={[styles.chartSubtitle, { color: colors.onSurfaceVariant }]}>{t('tapBarToFilter')}</Text>
                  </View>
                  {!!selectedMonthKey && (
                    <TouchableOpacity
                      style={[styles.dropdownPicker, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.primary }]}
                      onPress={() => {
                        hapticService.selection();
                        setSelectedMonthKey(null);
                      }}
                    >
                      <Text style={[styles.dropdownText, { color: colors.primary, fontWeight: '600' }]}>{t('showAll')}</Text>
                      <MaterialIcons name="close" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.barChartContainer, { borderBottomColor: colors.outlineVariant }]}>
                  <View style={styles.gridLines}>
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                    <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                  </View>

                  <ScrollView
                    ref={barScrollRef}
                    horizontal={!isLargeScreen}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                      styles.barsArea,
                      !isLargeScreen && styles.barsAreaScrollable
                    ]}
                    style={{ flex: 1, zIndex: 10 }}
                  >
                    {monthlyBarData.map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.barColumn,
                          !isLargeScreen && styles.barColumnScrollable
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          hapticService.selection();
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
                          item.isSelected && { backgroundColor: colors.primary }
                        ]}>
                          <Text style={[
                            styles.barLabel,
                            { color: item.isSelected ? colors.onPrimary : colors.onSurfaceVariant },
                            item.isSelected && { fontWeight: '700' }
                          ]}>
                            {item.month}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Pie Chart (Simulated Donut) */}
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.pieChartCardDesktop]}>
                <Text style={[styles.chartTitle, { color: colors.onSurface }]}>{t('courierBreakdown')}</Text>
                {selectedMonthLabel && (
                  <Text style={[styles.chartSubtitle, { color: colors.onSurfaceVariant }]}>{selectedMonthLabel}</Text>
                )}

                {/* Proportional SVG Donut Chart */}
                <View style={styles.donutChartContainer}>
                  <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
                    <Svg width={160} height={160} viewBox="0 0 160 160">
                      <G rotation="-90" origin="80, 80">
                        {/* Background Track Ring */}
                        <Circle
                          cx={80}
                          cy={80}
                          r={68}
                          stroke={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
                          strokeWidth={20}
                          fill="transparent"
                        />
                        {/* Mathematical Proportional Slices */}
                        {(() => {
                          let accumulatedFraction = 0;
                          const circumference = 2 * Math.PI * 68;
                          return courierStats.breakdown.map((item, index) => {
                            const sliceLength = item.fraction * circumference;
                            const strokeDashoffset = -accumulatedFraction * circumference;
                            accumulatedFraction += item.fraction;
                            const gap = courierStats.breakdown.length > 1 ? 2.5 : 0;

                            return (
                              <Circle
                                key={index}
                                cx={80}
                                cy={80}
                                r={68}
                                stroke={item.color}
                                strokeWidth={20}
                                strokeDasharray={`${Math.max(0, sliceLength - gap)} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                fill="transparent"
                              />
                            );
                          });
                        })()}
                      </G>
                    </Svg>

                    {/* Center Text (Total Companies) */}
                    <View style={styles.donutCenterContent} pointerEvents="none">
                      <Text style={[styles.donutCenterText, { color: colors.onSurface }]}>{courierStats.totalCompanies}</Text>
                      <Text style={[styles.donutCenterSubtext, { color: colors.onSurfaceVariant }]}>{t('companyUnit')}</Text>
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

export default StatisticsScreen;
