import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { G, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../store/auth.store';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { useTranslation } from '../hooks/useTranslation';
import { useStatisticsAnalytics } from '../hooks/useStatisticsAnalytics';
import { hapticService } from '../services/haptics.service';
import { styles } from './StatisticsScreen.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const StatisticsScreen = () => {
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { theme: colors, isDarkMode } = useTheme();
  const { t, language } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const { data: dbShipments, isLoading } = useShipments(user?.id);

  const barScrollRef = useRef<ScrollView>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);

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

  const handleToggleCarrier = (carrierName: string) => {
    hapticService.selection();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCarrier((prev) => (prev === carrierName ? null : carrierName));
  };

  const handleDonutTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const cx = 85;
    const cy = 85;
    const dx = locationX - cx;
    const dy = locationY - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If tapped near center while there's a selection -> toggle/reset
    if (distance < 45) {
      if (selectedCarrier) {
        handleToggleCarrier(selectedCarrier);
      }
      return;
    }

    // If tapped on the circular ring area (45 <= distance <= 95)
    if (distance >= 45 && distance <= 98 && courierStats.breakdown.length > 0) {
      let deg = Math.atan2(dy, dx) * (180 / Math.PI);
      let adjustedDeg = (deg + 90 + 360) % 360;
      let touchFrac = adjustedDeg / 360;

      let accumulated = 0;
      for (const item of courierStats.breakdown) {
        accumulated += item.fraction;
        if (touchFrac <= accumulated + 0.005) {
          handleToggleCarrier(item.label);
          break;
        }
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.appBarContent}>
          <Text style={[styles.appBarTitle, { flex: 1, color: colors.primary }]}>{t('analyticsAndReporting')}</Text>
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
                  <Text style={[styles.statValue, { color: colors.primary }]}>{avgDeliveryDaysFormatted} <Text style={[styles.statValueUnit, { color: colors.onSurfaceVariant }]}>{t('daysUnit')}</Text></Text>
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

              {/* Pie Chart (Interactive Donut) */}
              <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.pieChartCardDesktop]}>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={[styles.chartTitle, { color: colors.onSurface }]}>{t('courierBreakdown')}</Text>
                    {selectedMonthLabel && (
                      <Text style={[styles.chartSubtitle, { color: colors.onSurfaceVariant }]}>{selectedMonthLabel}</Text>
                    )}
                  </View>
                </View>

                {/* Proportional SVG Donut Chart with Touch Area */}
                <View style={styles.donutChartContainer}>
                  <View
                    style={{ width: 170, height: 170, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                    onStartShouldSetResponder={() => true}
                    onResponderRelease={handleDonutTouch}
                  >
                    <Svg width={170} height={170} viewBox="0 0 170 170" pointerEvents="none">
                      <G rotation="-90" origin="85, 85">
                        {/* Background Track Ring */}
                        <Circle
                          cx={85}
                          cy={85}
                          r={68}
                          stroke={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
                          strokeWidth={20}
                          fill="transparent"
                        />
                        {/* Mathematical Proportional Slices with Interactive Opacity */}
                        {(() => {
                          let accumulatedFraction = 0;
                          const circumference = 2 * Math.PI * 68;
                          return courierStats.breakdown.map((item, index) => {
                            const sliceLength = item.fraction * circumference;
                            const strokeDashoffset = -accumulatedFraction * circumference;
                            accumulatedFraction += item.fraction;
                            const gap = courierStats.breakdown.length > 1 ? 3 : 0;
                            const isSelected = selectedCarrier === item.label;
                            const hasSelection = Boolean(selectedCarrier);
                            const sliceOpacity = isSelected ? 1 : hasSelection ? 0.25 : 1;
                            const strokeWidth = isSelected ? 24 : (hasSelection ? 16 : 20);

                            return (
                              <Circle
                                key={index}
                                cx={85}
                                cy={85}
                                r={68}
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${Math.max(0, sliceLength - gap)} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeOpacity={sliceOpacity}
                                fill="transparent"
                              />
                            );
                          });
                        })()}
                      </G>
                    </Svg>

                    {/* Center Text (Total Companies or Selected Carrier with Clean Reset) */}
                    <View style={styles.donutCenterContent} pointerEvents="none">
                      {(() => {
                        if (selectedCarrier) {
                          const matched = courierStats.breakdown.find(b => b.label === selectedCarrier);
                          return (
                            <View style={{ alignItems: 'center', paddingHorizontal: 8 }}>
                              <Text style={[styles.donutCenterText, { color: matched?.color || colors.primary, fontSize: 24 }]}>
                                {matched ? matched.count : 0}
                              </Text>
                              <Text style={[styles.donutCenterSubtext, { color: colors.onSurface, fontWeight: '600' }]} numberOfLines={1}>
                                {matched?.label || t('companyUnit')}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                                <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: colors.primary }}>
                                  {t('showAll')}
                                </Text>
                                <MaterialIcons name="close" size={12} color={colors.primary} />
                              </View>
                            </View>
                          );
                        }
                        return (
                          <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.donutCenterText, { color: colors.onSurface }]}>{courierStats.totalCompanies}</Text>
                            <Text style={[styles.donutCenterSubtext, { color: colors.onSurfaceVariant }]}>{t('companyUnit')}</Text>
                          </View>
                        );
                      })()}
                    </View>
                  </View>
                </View>

                {courierStats.breakdown.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                    {selectedMonthLabel
                      ? (language === 'en' ? `No shipments found for ${selectedMonthLabel}.` : `${selectedMonthLabel} ${t('noShipmentsForMonth')}`)
                      : (t('noShipmentsYet') || (language === 'en' ? 'No shipments recorded yet.' : 'Henüz kayıtlı kargo bulunmuyor.'))}
                  </Text>
                ) : (
                  <View style={styles.legendContainer}>
                    {courierStats.breakdown.map((item, i) => {
                      const isSelected = selectedCarrier === item.label;
                      const hasSelection = Boolean(selectedCarrier);
                      const rowOpacity = isSelected ? 1 : hasSelection ? 0.35 : 1;
                      const unitLabel = language === 'en'
                        ? (item.count === 1 ? 'package' : 'packages')
                        : (t('cargoUnit') || 'kargo');

                      return (
                        <View
                          key={i}
                          style={[
                            styles.legendRow,
                            {
                              opacity: rowOpacity,
                              paddingVertical: 5,
                              paddingHorizontal: 8,
                              borderRadius: 8,
                              backgroundColor: isSelected ? (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)') : 'transparent',
                            }
                          ]}
                        >
                          <View style={styles.legendLeft}>
                            <View style={[styles.legendDot, { backgroundColor: item.color, width: isSelected ? 12 : 10, height: isSelected ? 12 : 10, borderRadius: 6 }]} />
                            <Text style={[
                              styles.legendLabel,
                              { color: colors.onSurface },
                              isSelected && { fontWeight: '700', color: item.color }
                            ]}>
                              {item.label}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[
                              styles.legendValue,
                              { color: colors.onSurface },
                              isSelected && { fontWeight: '700', color: item.color }
                            ]}>
                              {item.count} {unitLabel} ({item.pct})
                            </Text>
                            {isSelected && (
                              <MaterialIcons name="check" size={16} color={item.color} />
                            )}
                          </View>
                        </View>
                      );
                    })}
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
