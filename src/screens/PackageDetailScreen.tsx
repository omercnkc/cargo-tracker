import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
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
import { useUserAddresses } from '../hooks/useUserAddresses';
import { ShipmentMapView } from '../components/map/ShipmentMapView';
import { useShipmentRealtime } from '../hooks/useShipmentRealtime';
import { LocationPoint } from '../types/location';
import { resolveShipmentCarrier } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { getShipmentProgress, translateTimelineEvent } from '../utils/shipmentUtils';
import { hapticService } from '../services/haptics.service';
import { getMockShipmentDetailsMap } from '../mock/fallbackPackages';
import { styles } from './PackageDetailScreen.styles';

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
  const { addresses: savedAddresses, defaultAddress: activeDefaultAddress } = useUserAddresses();

  // Supabase Realtime Canlı Takip Hook'u
  useShipmentRealtime(shipmentId);

  // Dynamic mock map for all sample packages
  const mockShipmentDetailsMap = useMemo(() => {
    return getMockShipmentDetailsMap(activeDefaultAddress);
  }, [activeDefaultAddress]);

  // Fallback mock detail if not found or demo preview
  const displayShipment = shipment || (shipmentId && mockShipmentDetailsMap[shipmentId]) || mockShipmentDetailsMap['mock-1'] || {
    id: 'demo',
    tracking_number: shipmentId || 'TY7382910482',
    title: 'Trendyol Express Paketim',
    current_status: 'out_for_delivery',
    sender: 'Trendyol Satıcısı',
    receiver: activeDefaultAddress ? `${activeDefaultAddress.fullName}\n${activeDefaultAddress.fullAddress}` : 'Ahmet Yılmaz\nBeşiktaş, İstanbul',
    last_location: `${activeDefaultAddress?.district || 'Beşiktaş'} Dağıtım Bölgesi, ${activeDefaultAddress?.city || 'İstanbul'}`,
    estimated_delivery: 'Bugün, 14:00 - 18:00',
    courier_companies: { name: 'Trendyol Express' },
    shipment_events: [
      { id: 'e1', status: 'Dağıtıma Çıkarıldı', description: 'Kurye teslimat adresinize doğru yola çıktı.', location: `${activeDefaultAddress?.district || 'Beşiktaş'} Şubesi`, event_time: 'Bugün, 09:15' },
      { id: 'e2', status: 'Transfer Merkezinde', description: 'Avrupa Yakası Aktarma Merkezi', location: activeDefaultAddress?.city || 'İstanbul', event_time: 'Dün, 22:45' },
      { id: 'e3', status: 'Sipariş Alındı', description: 'Gönderici kargoyu şubeye teslim etti.', location: 'İzmir', event_time: 'Dün, 14:10' },
    ]
  };

  // Bu spesifik kargoya atanmış alıcı teslimat adresini ve koordinatlarını çözümle
  const shipmentReceiverAddress = useMemo(() => {
    const receiverText = (displayShipment.receiver || '').toLowerCase().trim();

    if (receiverText && savedAddresses.length > 0) {
      const matched = savedAddresses.find((addr) => {
        const full = addr.fullAddress.toLowerCase().trim();
        const dist = (addr.district || '').toLowerCase().trim();
        const ttl = (addr.title || '').toLowerCase().trim();
        return (
          receiverText.includes(full) ||
          full.includes(receiverText) ||
          (dist && receiverText.includes(dist)) ||
          (ttl && receiverText.includes(ttl))
        );
      });
      if (matched) return matched;
    }

    return activeDefaultAddress;
  }, [displayShipment.receiver, savedAddresses, activeDefaultAddress]);

  const nowMs = Date.now();

  // Alıcı (User) Teslimat Adresi Konumu (Kargonun Kayıtlı Alıcı Adresi)
  const mapDestination: LocationPoint = useMemo(() => {
    const lat = shipmentReceiverAddress?.latitude || 41.0425;
    const lng = shipmentReceiverAddress?.longitude || 29.0068;
    const destTitle = shipmentReceiverAddress?.title
      ? `${shipmentReceiverAddress.title} - ${shipmentReceiverAddress.fullName}`
      : (shipmentReceiverAddress?.fullName || 'Teslimat Adresi');

    return {
      latitude: lat,
      longitude: lng,
      title: destTitle,
      description: shipmentReceiverAddress?.fullAddress || displayShipment.receiver || 'Beşiktaş, İstanbul',
      recordedAt: new Date(nowMs).toISOString(),
    };
  }, [shipmentReceiverAddress, displayShipment.receiver, nowMs]);

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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              {(() => {
                const carrier = resolveShipmentCarrier(displayShipment);
                return carrier.logo ? <CarrierLogo logo={carrier.logo} size={32} /> : null;
              })()}
              <View style={{ flex: 1 }}>
                <Text style={[styles.trackingLabel, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                  {displayShipment.title ? `${displayShipment.title} (${resolveShipmentCarrier(displayShipment).name})` : resolveShipmentCarrier(displayShipment).name}
                </Text>
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

          {/* Clean Map View: Focused Only on User's Delivery Address */}
          <ShipmentMapView
            destination={mapDestination}
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

export default PackageDetailScreen;
