import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

// Simulated Bar Chart Data
import useResponsive from '../hooks/useResponsive';

const BAR_CHART_DATA = [
  { month: 'Jan', value: 120, height: '33.3%' },
  { month: 'Feb', value: 180, height: '50%' },
  { month: 'Mar', value: 150, height: '40%' },
  { month: 'Apr', value: 280, height: '75%' },
  { month: 'May', value: 350, height: '100%', active: true },
  { month: 'Jun', value: 300, height: '80%' },
];

export const StatisticsScreen = () => {
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();

  return (
    <View style={[styles.container, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar (Desktop) / Mobile Header */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          {isLargeScreen ? (
            <>
              <View style={styles.headerLeft}>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons name="menu" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.appBarTitle}>KargoTakip</Text>
              </View>
              <View style={styles.headerNav}>
                <Text style={styles.navLink}>Home</Text>
                <Text style={styles.navLink}>Packages</Text>
                <Text style={styles.navLinkActive}>Stats</Text>
                <Text style={styles.navLink}>Profile</Text>
              </View>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[styles.appBarTitle, { flex: 1 }]}>Statistics</Text>
          )}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
        ]}
      >
        <View style={styles.pageHeader}>
          {isLargeScreen && <Text style={styles.pageTitle}>Dashboard Overview</Text>}
          <Text style={styles.pageSubtitle}>Your shipping performance at a glance.</Text>
        </View>

        <View style={[styles.bentoGrid, isLargeScreen && styles.bentoGridDesktop]}>
          
          {/* KPI Row (Mobile: column, Desktop: row) */}
          <View style={[styles.kpiRow, isLargeScreen && styles.kpiRowDesktop]}>
            
            {/* Total Packages */}
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>TOTAL PACKAGES</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialIcons name="inventory" size={16} color={colors.onPrimaryContainer} />
                </View>
              </View>
              <View>
                <Text style={styles.statValue}>1,248</Text>
                <View style={styles.trendRow}>
                  <MaterialIcons name="trending-up" size={12} color={colors.tertiary} />
                  <Text style={styles.trendTextUp}>+12% from last month</Text>
                </View>
              </View>
            </View>

            {/* Average Delivery Time */}
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>AVG DELIVERY TIME</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="timer" size={16} color={colors.primary} />
                </View>
              </View>
              <View>
                <Text style={styles.statValue}>2.4 <Text style={styles.statValueUnit}>Days</Text></Text>
                <View style={styles.trendRow}>
                  <MaterialIcons name="trending-down" size={12} color={colors.tertiary} />
                  <Text style={styles.trendTextUp}>-0.3 days improvement</Text>
                </View>
              </View>
            </View>

            {/* Success Rate */}
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>DELIVERY SUCCESS</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.tertiaryFixed }]}>
                  <MaterialIcons name="check-circle" size={16} color={colors.onTertiaryFixedVariant} />
                </View>
              </View>
              <View>
                <Text style={styles.statValue}>98.2%</Text>
                <View style={styles.trendRow}>
                  <Text style={styles.trendTextNeutral}>Consistent performance</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Charts Row */}
          <View style={[styles.chartsRow, isLargeScreen && styles.chartsRowDesktop]}>
            
            {/* Bar Chart */}
            <View style={[styles.statCard, isLargeScreen && styles.barChartCardDesktop]}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Monthly Deliveries</Text>
                <View style={styles.dropdownPicker}>
                  <Text style={styles.dropdownText}>Last 6 Months</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color={colors.onSurface} />
                </View>
              </View>

              <View style={styles.barChartContainer}>
                {/* Horizontal Grid Lines */}
                <View style={styles.gridLines}>
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                </View>

                {/* Bars */}
                <View style={styles.barsArea}>
                  {BAR_CHART_DATA.map((item, index) => (
                    <View key={index} style={styles.barColumn}>
                      <View style={styles.barTrack}>
                        <View style={[
                          styles.barFill, 
                          { height: item.height as any },
                          item.active && { backgroundColor: colors.primary }
                        ]} />
                      </View>
                      <Text style={[
                        styles.barLabel,
                        item.active && styles.barLabelActive
                      ]}>
                        {item.month}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Pie Chart (Simulated Donut) */}
            <View style={[styles.statCard, isLargeScreen && styles.pieChartCardDesktop]}>
              <Text style={styles.chartTitle}>Company Distribution</Text>
              
              <View style={styles.donutChartContainer}>
                {/* Simplified visual representation of donut chart for Native */}
                <View style={styles.donutOuter}>
                  <View style={styles.donutInner}>
                    <Text style={styles.donutCenterText}>4</Text>
                  </View>
                </View>
              </View>

              <View style={styles.legendContainer}>
                <View style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendLabel}>SpeedyGo Logistics</Text>
                  </View>
                  <Text style={styles.legendValue}>45%</Text>
                </View>
                
                <View style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primaryContainer }]} />
                    <Text style={styles.legendLabel}>Global Freight</Text>
                  </View>
                  <Text style={styles.legendValue}>30%</Text>
                </View>
                
                <View style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: colors.surfaceTint }]} />
                    <Text style={styles.legendLabel}>City Express</Text>
                  </View>
                  <Text style={styles.legendValue}>15%</Text>
                </View>
                
                <View style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primaryFixed }]} />
                    <Text style={styles.legendLabel}>Others</Text>
                  </View>
                  <Text style={styles.legendValue}>10%</Text>
                </View>
              </View>

            </View>
          </View>
        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // using exact color from mockup for bg
  },
  appBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
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
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16, // margin-mobile
    paddingTop: 16,
    maxWidth: 1280, // max-w-7xl
    alignSelf: 'center',
    width: '100%',
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 32, // headline-lg
    fontWeight: '700',
    letterSpacing: -0.64,
    color: colors.onSurface,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurfaceVariant,
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
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: '#E2E8F0', // specific to this mockup
    borderRadius: 12,
    padding: 24,
    shadowColor: colors.primaryContainer,
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
    fontSize: 14, // body-sm
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.7,
  },
  iconBox: {
    padding: 8,
    borderRadius: 999,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 32, // text-4xl equivalent roughly
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statValueUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendTextUp: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.tertiary,
  },
  trendTextNeutral: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  chartsRow: {
    flexDirection: 'column',
    gap: 16,
    marginTop: 16,
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
    fontSize: 20, // headline-md
    fontWeight: '600',
    color: colors.onSurface,
  },
  dropdownPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  dropdownText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurface,
  },
  barChartContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: 8,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30, // account for labels
    justifyContent: 'space-between',
    zIndex: 0,
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.outlineVariant,
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
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: '10%',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primaryContainer,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  barLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  donutChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    minHeight: 160,
  },
  donutOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primaryContainer,
    // Note: Conic gradients not directly supported in standard RN Views.
    // Using a solid color or border hack to simulate chart presence.
    borderWidth: 20,
    borderColor: colors.primary,
    borderTopColor: colors.primaryFixed,
    borderRightColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    color: colors.onSurface,
  },
  legendContainer: {
    marginTop: 16,
    gap: 12,
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
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurface,
  },
  legendValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.onPrimaryContainer,
    marginTop: 4,
  },
});

export default StatisticsScreen;
