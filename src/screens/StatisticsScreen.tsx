import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import useResponsive from '../hooks/useResponsive';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ExportUtils } from '../utils/exportUtils';
import { QRCodeModal } from '../components/package/QRCodeModal';

const BAR_CHART_DATA = [
  { month: 'Oca', value: 120, height: '33.3%' },
  { month: 'Şub', value: 180, height: '50%' },
  { month: 'Mar', value: 150, height: '40%' },
  { month: 'Nis', value: 280, height: '75%' },
  { month: 'May', value: 350, height: '100%', active: true },
  { month: 'Haz', value: 300, height: '80%' },
];

export const StatisticsScreen = () => {
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { isOnline, pendingCount } = useNetworkStatus();
  const { theme: colors, isDarkMode } = useTheme();

  const [qrModalVisible, setQrModalVisible] = useState(false);

  const sampleExportData = [
    { tracking_number: 'TR-849201048', title: 'Elektronik Sipariş', courier_company: 'Aras Kargo', current_status: 'Dağıtımda', created_at: '2026-07-29' },
    { tracking_number: 'TR-102938475', title: 'Kitap Paketi', courier_company: 'Yurtiçi Kargo', current_status: 'Teslim Edildi', created_at: '2026-07-28' },
    { tracking_number: 'TR-994820194', title: 'Kıyafet Siparişi', courier_company: 'PTT Kargo', current_status: 'Aktarmada', created_at: '2026-07-27' },
  ];

  const handleExportCSV = async () => {
    const csvData = await ExportUtils.exportShipmentsToCSV(sampleExportData);
    Alert.alert('📄 CSV Raporu Oluşturuldu', 'Geçmiş kargo raporu CSV formatında hazırlandı:\n\n' + csvData.substring(0, 150) + '...');
  };

  const handleExportPDFReport = async () => {
    await ExportUtils.exportShipmentToPDF({
      tracking_number: 'TR-GENEL-RAPOR',
      title: 'Aylık Kargo İstatistik Raporu',
      sender: 'KargoTakip Analitik Servisi',
      receiver: 'Ömer Ç.',
      current_status: 'Başarılı (%98.2)',
      courier_company: 'Tüm Kargo Firmaları',
    });
  };

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
          <View>
            <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Performans Özeti</Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>Kargo teslimat ve istatistik raporlarınız</Text>
          </View>

          {/* Export Action Buttons */}
          <View style={styles.exportButtonRow}>
            <TouchableOpacity style={[styles.exportBtn, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]} onPress={handleExportCSV} activeOpacity={0.8}>
              <MaterialIcons name="table-chart" size={18} color={colors.primary} />
              <Text style={[styles.exportBtnText, { color: colors.primary }]}>CSV İndir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={handleExportPDFReport} activeOpacity={0.8}>
              <MaterialIcons name="picture-as-pdf" size={18} color={colors.onPrimary} />
              <Text style={[styles.exportBtnText, { color: colors.onPrimary }]}>PDF Rapor Al</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.exportBtn, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]} onPress={() => setQrModalVisible(true)} activeOpacity={0.8}>
              <MaterialIcons name="qr-code" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.bentoGrid, isLargeScreen && styles.bentoGridDesktop]}>
          
          {/* KPI Row */}
          <View style={[styles.kpiRow, isLargeScreen && styles.kpiRowDesktop]}>
            
            {/* Total Packages */}
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <View style={styles.statCardHeader}>
                <Text style={[styles.statCardLabel, { color: colors.onSurfaceVariant }]}>TOPLAM KARGO</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialIcons name="inventory" size={16} color={colors.onPrimaryContainer} />
                </View>
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.primary }]}>1,248</Text>
                <View style={styles.trendRow}>
                  <MaterialIcons name="trending-up" size={12} color={colors.tertiary} />
                  <Text style={[styles.trendTextUp, { color: colors.tertiary }]}>+12% geçen aya göre</Text>
                </View>
              </View>
            </View>

            {/* Average Delivery Time */}
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <View style={styles.statCardHeader}>
                <Text style={[styles.statCardLabel, { color: colors.onSurfaceVariant }]}>ORT. TESLİMAT SÜRESİ</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="timer" size={16} color={colors.primary} />
                </View>
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.primary }]}>2.4 <Text style={[styles.statValueUnit, { color: colors.onSurfaceVariant }]}>Gün</Text></Text>
                <View style={styles.trendRow}>
                  <MaterialIcons name="trending-down" size={12} color={colors.tertiary} />
                  <Text style={[styles.trendTextUp, { color: colors.tertiary }]}>-0.3 gün iyileşme</Text>
                </View>
              </View>
            </View>

            {/* Success Rate */}
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <View style={styles.statCardHeader}>
                <Text style={[styles.statCardLabel, { color: colors.onSurfaceVariant }]}>TESLİMAT BAŞARISI</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.tertiaryContainer }]}>
                  <MaterialIcons name="check-circle" size={16} color={colors.onTertiaryContainer} />
                </View>
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.primary }]}>98.2%</Text>
                <Text style={[styles.trendTextNeutral, { color: colors.onSurfaceVariant }]}>Yüksek performans</Text>
              </View>
            </View>
          </View>

          {/* Charts Row */}
          <View style={[styles.chartsRow, isLargeScreen && styles.chartsRowDesktop]}>
            
            {/* Bar Chart */}
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.barChartCardDesktop]}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartTitle, { color: colors.onSurface }]}>Aylık Gönderi Dağılımı</Text>
                <View style={[styles.dropdownPicker, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Text style={[styles.dropdownText, { color: colors.onSurface }]}>Son 6 Ay</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color={colors.onSurface} />
                </View>
              </View>

              <View style={[styles.barChartContainer, { borderBottomColor: colors.outlineVariant }]}>
                <View style={styles.gridLines}>
                  <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                  <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                  <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                  <View style={[styles.gridLine, { backgroundColor: colors.outlineVariant }]} />
                </View>

                <View style={styles.barsArea}>
                  {BAR_CHART_DATA.map((item, index) => (
                    <View key={index} style={styles.barColumn}>
                      <View style={styles.barTrack}>
                        <View style={[
                          styles.barFill, 
                          { height: item.height as any, backgroundColor: item.active ? colors.primary : colors.primaryContainer },
                        ]} />
                      </View>
                      <Text style={[
                        styles.barLabel,
                        { color: item.active ? colors.primary : colors.onSurfaceVariant },
                        item.active && { fontWeight: '700' }
                      ]}>
                        {item.month}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Pie Chart (Simulated Donut) */}
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.pieChartCardDesktop]}>
              <Text style={[styles.chartTitle, { color: colors.onSurface }]}>Kargo Firması Oranları</Text>
              
              <View style={styles.donutChartContainer}>
                <View style={[styles.donutOuter, { backgroundColor: colors.primaryContainer, borderColor: colors.primary, borderTopColor: colors.primaryFixed, borderRightColor: colors.surfaceTint }]}>
                  <View style={[styles.donutInner, { backgroundColor: colors.surfaceContainerLowest }]}>
                    <Text style={[styles.donutCenterText, { color: colors.onSurface }]}>4</Text>
                  </View>
                </View>
              </View>

              <View style={styles.legendContainer}>
                {[
                  { color: colors.primary, label: 'Aras Kargo', pct: '45%' },
                  { color: colors.primaryContainer, label: 'Yurtiçi Kargo', pct: '30%' },
                  { color: colors.surfaceTint, label: 'PTT Kargo', pct: '15%' },
                  { color: colors.primaryFixed, label: 'Diğerleri', pct: '10%' },
                ].map((item, i) => (
                  <View key={i} style={styles.legendRow}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.legendLabel, { color: colors.onSurface }]}>{item.label}</Text>
                    </View>
                    <Text style={[styles.legendValue, { color: colors.onSurface }]}>{item.pct}</Text>
                  </View>
                ))}
              </View>

            </View>
          </View>
        </View>
      </ScrollView>

      {/* QR Modal */}
      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        shipment={{
          tracking_number: 'TR-849201048',
          title: 'Aras Kargo Paketim',
          sender: 'TechStore Elektronik A.Ş.',
          receiver: 'Ahmet Yılmaz',
          current_status: 'Dağıtımda',
        }}
      />
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
  exportButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '600',
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
  trendTextUp: {
    fontFamily: 'Inter',
    fontSize: 13,
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
  barLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
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
