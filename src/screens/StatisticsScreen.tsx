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
import colors from '../theme/colors';
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
    <View style={[styles.container, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          <Text style={[styles.appBarTitle, { flex: 1 }]}>Analiz & Raporlama</Text>
          
          {/* Network Status Badge */}
          <View style={[styles.networkBadge, { backgroundColor: isOnline ? '#dcfce7' : '#fee2e2' }]}>
            <MaterialIcons name={isOnline ? "wifi" : "wifi-off"} size={14} color={isOnline ? "#166534" : "#991b1b"} />
            <Text style={[styles.networkBadgeText, { color: isOnline ? "#166534" : "#991b1b" }]}>
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
            <Text style={styles.pageTitle}>Performans Özeti</Text>
            <Text style={styles.pageSubtitle}>Kargo teslimat ve istatistik raporlarınız</Text>
          </View>

          {/* Export Action Buttons */}
          <View style={styles.exportButtonRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV} activeOpacity={0.8}>
              <MaterialIcons name="table-chart" size={18} color={colors.primary} />
              <Text style={styles.exportBtnText}>CSV İndir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.exportBtn, styles.exportBtnPrimary]} onPress={handleExportPDFReport} activeOpacity={0.8}>
              <MaterialIcons name="picture-as-pdf" size={18} color="#ffffff" />
              <Text style={styles.exportBtnTextPrimary}>PDF Rapor Al</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportBtn} onPress={() => setQrModalVisible(true)} activeOpacity={0.8}>
              <MaterialIcons name="qr-code" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.bentoGrid, isLargeScreen && styles.bentoGridDesktop]}>
          
          {/* KPI Row */}
          <View style={[styles.kpiRow, isLargeScreen && styles.kpiRowDesktop]}>
            
            {/* Total Packages */}
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>TOPLAM KARGO</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialIcons name="inventory" size={16} color={colors.onPrimaryContainer} />
                </View>
              </View>
              <View>
                <Text style={styles.statValue}>1,248</Text>
                <View style={styles.trendRow}>
                  <MaterialIcons name="trending-up" size={12} color={colors.tertiary} />
                  <Text style={styles.trendTextUp}>+12% geçen aya göre</Text>
                </View>
              </View>
            </View>

            {/* Average Delivery Time */}
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>ORT. TESLİMAT SÜRESİ</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="timer" size={16} color={colors.primary} />
                </View>
              </View>
              <View>
                <Text style={styles.statValue}>2.4 <Text style={styles.statValueUnit}>Gün</Text></Text>
                <View style={styles.trendRow}>
                  <MaterialIcons name="trending-down" size={12} color={colors.tertiary} />
                  <Text style={styles.trendTextUp}>-0.3 gün iyileşme</Text>
                </View>
              </View>
            </View>

            {/* Success Rate */}
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>TESLİMAT BAŞARISI</Text>
                <View style={[styles.iconBox, { backgroundColor: colors.tertiaryFixed }]}>
                  <MaterialIcons name="check-circle" size={16} color={colors.onTertiaryFixedVariant} />
                </View>
              </View>
              <View>
                <Text style={styles.statValue}>98.2%</Text>
                <View style={styles.trendRow}>
                  <Text style={styles.trendTextNeutral}>Yüksek performans</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Charts Row */}
          <View style={[styles.chartsRow, isLargeScreen && styles.chartsRowDesktop]}>
            
            {/* Bar Chart */}
            <View style={[styles.statCard, isLargeScreen && styles.barChartCardDesktop]}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Aylık Gönderi Dağılımı</Text>
                <View style={styles.dropdownPicker}>
                  <Text style={styles.dropdownText}>Son 6 Ay</Text>
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
              <Text style={styles.chartTitle}>Kargo Firması Oranları</Text>
              
              <View style={styles.donutChartContainer}>
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
                    <Text style={styles.legendLabel}>Aras Kargo</Text>
                  </View>
                  <Text style={styles.legendValue}>45%</Text>
                </View>
                
                <View style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primaryContainer }]} />
                    <Text style={styles.legendLabel}>Yurtiçi Kargo</Text>
                  </View>
                  <Text style={styles.legendValue}>30%</Text>
                </View>
                
                <View style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: colors.surfaceTint }]} />
                    <Text style={styles.legendLabel}>PTT Kargo</Text>
                  </View>
                  <Text style={styles.legendValue}>15%</Text>
                </View>
                
                <View style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primaryFixed }]} />
                    <Text style={styles.legendLabel}>Diğerleri</Text>
                  </View>
                  <Text style={styles.legendValue}>10%</Text>
                </View>
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
    backgroundColor: '#F8FAFC',
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
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
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
    color: colors.onSurface,
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
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
    borderColor: colors.outlineVariant,
    backgroundColor: '#ffffff',
  },
  exportBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  exportBtnTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
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
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
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
    fontSize: 12,
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
    fontSize: 28,
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
    fontSize: 13,
    color: colors.tertiary,
  },
  trendTextNeutral: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.onSurfaceVariant,
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
    fontSize: 13,
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
    bottom: 30,
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
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryContainer,
    borderWidth: 18,
    borderColor: colors.primary,
    borderTopColor: colors.primaryFixed,
    borderRightColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: colors.onSurface,
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
    color: colors.onSurface,
  },
  legendValue: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
  },
});

export default StatisticsScreen;
