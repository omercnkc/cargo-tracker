import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    gap: 10,
  },
  kpiRowDesktop: {
    flexDirection: 'row',
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statCardLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  iconBox: {
    padding: 6,
    borderRadius: 999,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  statValueUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendTextNeutral: {
    fontFamily: 'Inter',
    fontSize: 12,
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
  barsAreaScrollable: {
    minWidth: 580,
    paddingHorizontal: 6,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barColumnScrollable: {
    width: 46,
    flex: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    minHeight: 160,
  },
  donutCenterContent: {
    position: 'absolute',
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
