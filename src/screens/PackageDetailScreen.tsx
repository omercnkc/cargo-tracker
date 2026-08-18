import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useShipmentDetail } from '../features/shipment/hooks/useShipments';
import HeaderRightActions from '../components/common/HeaderRightActions';
import { ShipmentMapView } from '../components/map/ShipmentMapView';
import { useShipmentRealtime } from '../hooks/useShipmentRealtime';
import { LocationPoint } from '../types/location';
import { getCarrierByName } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { getShipmentProgress, translateTimelineEvent } from '../utils/shipmentUtils';
import { hapticService } from '../services/haptics.service';

export const PackageDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const isLargeScreen = width >= 768;

  const shipmentId = route.params?.id;
  const { data: shipment, isLoading } = useShipmentDetail(shipmentId);

  // Supabase Realtime Canlı Takip Hook'u
  useShipmentRealtime(shipmentId);

  // Fallback mock detail if not found or demo preview
  const displayShipment = shipment || {
    id: 'demo',
    tracking_number: shipmentId || '24B392Q',
    title: 'Aras Kargo Paketim',
    current_status: 'transit',
    sender: 'TechStore Elektronik A.Ş.',
    receiver: 'Ahmet Yılmaz',
    last_location: 'Dolmabahçe Dağıtım Bölgesi, İstanbul',
    estimated_delivery: 'Bugün, 14:00 - 18:00',
    courier_companies: { name: 'Aras Kargo' },
    shipment_events: [
      { id: 'e1', status: 'Dağıtıma Çıkarıldı', description: 'Kurye teslimat adresinize doğru yola çıktı.', location: 'Beşiktaş Şubesi', event_time: 'Bugün, 09:15' },
      { id: 'e2', status: 'Transfer Merkezinde', description: 'Avrupa Yakası Aktarma Merkezi', location: 'İstanbul', event_time: 'Dün, 22:45' },
      { id: 'e3', status: 'Sipariş Alındı', description: 'Gönderici kargoyu şubeye teslim etti.', location: 'Ankara', event_time: 'Dün, 14:10' },
    ]
  };

  const nowMs = Date.now();

  // Alıcı (User) Teslimat Adresi Konumu (Dolmabahçe / Beşiktaş)
  const mapDestination: LocationPoint = {
    latitude: 41.0390,
    longitude: 29.0005,
    title: 'Ahmet Yılmaz - Teslimat Adresi',
    description: 'Beşiktaş, İstanbul',
    recordedAt: new Date(nowMs).toISOString(),
  };

  // Kuryenin 15 dk gecikmeli konum noktası (Aynı karada, Beşiktaş / Kabataş güzergahı üzerinde)
  const rawCourierLocations: LocationPoint[] = useMemo(() => [
    {
      latitude: 41.0330,
      longitude: 28.9920,
      title: 'Kargo Aracı (Dağıtımda)',
      recordedAt: new Date(nowMs - 20 * 60 * 1000).toISOString(), // 20 dk önce -> Son Güvenli Nokta
    },
    {
      latitude: 41.0360,
      longitude: 28.9960,
      title: 'Kurye Anlık Yakın Konum',
      recordedAt: new Date(nowMs - 3 * 60 * 1000).toISOString(), // 3 dk önce -> 15 DK FİLTRESİ İLE GİZLENİR
    },
  ], [nowMs]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            hapticService.buttonPress();
            navigation.goBack();
          }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('shipmentDetail')}</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.mainContent, 
            { paddingBottom: insets.bottom + 24 }
          ]}
        >
          {/* Summary Header */}
          <View style={[styles.summaryHeader, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {(() => {
                const cLogo = getCarrierByName(displayShipment.courier_companies?.name || displayShipment.title || '')?.logo;
                return cLogo ? <CarrierLogo logo={cLogo} size={32} /> : null;
              })()}
              <View>
                <Text style={[styles.trackingLabel, { color: colors.onSurfaceVariant }]}>{displayShipment.courier_companies?.name || displayShipment.title || t('trackingNumberLabel')}</Text>
                <Text style={[styles.trackingNumber, { color: colors.primary }]}>{displayShipment.tracking_number}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.secondaryFixed }]}>
              <MaterialIcons name="notifications-active" size={18} color={colors.secondary} />
              <Text style={[styles.statusBadgeText, { color: colors.onSecondaryFixedVariant }]}>
                {(() => {
                  const progressInfo = getShipmentProgress(displayShipment.current_status);
                  return t(progressInfo.titleKey as any) || progressInfo.stepTitle;
                })()}
              </Text>
            </View>
          </View>

          {/* Clean Map View: Only User Address & Courier Vehicle (No lines across sea) */}
          <ShipmentMapView
            destination={mapDestination}
            rawCourierLocations={rawCourierLocations}
            height={260}
          />

          {/* Bento Grid for Details & Timeline */}
          <View style={[styles.gridContainer, isLargeScreen && styles.gridContainerDesktop]}>
            
            {/* Details Section */}
            <View style={[styles.detailsSection, isLargeScreen && styles.detailsColDesktop]}>
              
              <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="info" size={24} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.primary }]}>{t('deliveryInfo')}</Text>
                </View>
                
                <View style={styles.infoGroup}>
                  <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{t('estimatedDelivery')}</Text>
                  <Text style={[styles.infoValuePrimary, { color: colors.onBackground }]}>{displayShipment.estimated_delivery || 'Bugün, 14:00 - 18:00'}</Text>
                </View>
                
                <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                
                <View style={styles.infoGroup}>
                  <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{t('sender')}</Text>
                  <Text style={[styles.infoValue, { color: colors.onBackground }]}>{displayShipment.sender || 'TechStore Elektronik A.Ş.'}</Text>
                </View>
                
                <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
                
                <View style={styles.infoGroup}>
                  <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{t('receiver')}</Text>
                  <Text style={[styles.infoValueSmall, { color: colors.onBackground }]}>
                    {displayShipment.receiver || 'Ahmet Yılmaz\nBeşiktaş, İstanbul'}
                  </Text>
                </View>
              </View>

            </View>

            {/* Vertical Timeline */}
            <View style={[styles.card, styles.timelineCard, isLargeScreen && styles.timelineColDesktop, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="history" size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.primary }]}>{t('timeline')}</Text>
              </View>

              <View style={styles.timelineContainer}>
                {displayShipment.shipment_events && displayShipment.shipment_events.length > 0 ? (
                  displayShipment.shipment_events.map((event: any, index: number) => {
                    const translated = translateTimelineEvent(event, t);
                    return (
                      <View key={event.id || index} style={styles.timelineStep}>
                        <View style={[
                          index === 0 ? styles.timelineDotActiveWrapper : styles.timelineDotCompleted,
                          { borderColor: colors.surfaceContainerLowest, backgroundColor: index === 0 ? colors.secondaryContainer : colors.tertiaryContainer }
                        ]}>
                          {index === 0 ? (
                            <View style={[styles.timelineDotActiveInner, { backgroundColor: colors.secondary }]} />
                          ) : (
                            <MaterialIcons name="check" size={12} color={colors.onTertiary} />
                          )}
                        </View>
                        <View style={[styles.timelineContent, index !== 0 && { opacity: 0.7 }]}>
                          <Text style={[index === 0 ? styles.timelineTitleActive : styles.timelineTitle, { color: colors.onBackground }]}>
                            {translated.status}
                          </Text>
                          {translated.description ? (
                            <Text style={[styles.timelineDescription, { color: colors.onSurfaceVariant }]}>{translated.description}</Text>
                          ) : null}
                          {translated.event_time ? (
                            <Text style={[styles.timelineTime, { color: colors.outline }]}>{translated.event_time}</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text style={[styles.timelineDescription, { color: colors.onSurfaceVariant }]}>{t('noEvents')}</Text>
                )}
              </View>
            </View>
            
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 50,
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
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 896,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trackingLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  trackingNumber: {
    fontFamily: 'Courier Prime',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  gridContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  gridContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailsSection: {
    flexDirection: 'column',
    gap: 16,
  },
  detailsColDesktop: {
    flex: 1,
  },
  timelineColDesktop: {
    flex: 2,
  },
  card: {
    borderWidth: 1,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
  },
  infoGroup: {
    marginVertical: 4,
  },
  infoLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoValuePrimary: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontFamily: 'Inter',
    fontSize: 16,
  },
  infoValueSmall: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  timelineContainer: {
    paddingLeft: 12,
    position: 'relative',
    marginTop: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  timelineDotActiveWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fea619',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    marginTop: 2,
  },
  timelineDotActiveInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#855300',
  },
  timelineDotCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#004a31',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitleActive: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
  },
  timelineTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineDescription: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 4,
  },
  timelineTime: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    marginTop: 4,
  },
});

export default PackageDetailScreen;
