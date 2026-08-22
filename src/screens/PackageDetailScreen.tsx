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
import { useShipmentDetail, useShipments } from '../features/shipment/hooks/useShipments';
import { useAuthStore } from '../store/auth.store';
import { useUserAddresses } from '../hooks/useUserAddresses';
import { ShipmentMapView } from '../components/map/ShipmentMapView';
import { useShipmentRealtime } from '../hooks/useShipmentRealtime';
import { LocationPoint } from '../types/location';
import { resolveShipmentCarrier, getCarrierByName } from '../constants/carriers';
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

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const currentUserName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const shipmentId = route.params?.id || route.params?.shipmentId;
  const { data: shipment, isLoading } = useShipmentDetail(shipmentId, user?.id);
  const { data: allUserShipments } = useShipments(user?.id);
  const { addresses: savedAddresses, defaultAddress: activeDefaultAddress } = useUserAddresses();

  // Supabase Realtime Canlı Takip Hook'u
  useShipmentRealtime(shipmentId);

  // Dynamic mock map for all sample packages with logged in user's name and independent addresses
  const mockShipmentDetailsMap = useMemo(() => {
    return getMockShipmentDetailsMap(savedAddresses, currentUserName);
  }, [savedAddresses, currentUserName]);

  const defaultReceiverAddr = useMemo(() => {
    const name = currentUserName || activeDefaultAddress?.fullName || 'Kullanıcı';
    if (activeDefaultAddress?.fullAddress) {
      return `${name}\n${activeDefaultAddress.fullAddress}`;
    }
    return `${name}\n${activeDefaultAddress?.district || 'Beşiktaş'}, ${activeDefaultAddress?.city || 'İstanbul'}`;
  }, [currentUserName, activeDefaultAddress]);

  const userDbShipment = useMemo(() => {
    if (!allUserShipments || allUserShipments.length === 0 || !shipmentId) return null;
    return allUserShipments.find(s => s.id === shipmentId || s.tracking_number === shipmentId);
  }, [allUserShipments, shipmentId]);

  // Fallback mock detail if not found or demo preview
  const displayShipment = useMemo(() => {
    if (shipment) return shipment;
    if (userDbShipment) return userDbShipment;
    if (shipmentId && mockShipmentDetailsMap[shipmentId]) {
      return mockShipmentDetailsMap[shipmentId];
    }
    if (route.params?.shipment) return route.params.shipment;
    if (route.params?.package) {
      const p = route.params.package;
      return {
        id: p.id || shipmentId,
        tracking_number: p.trackingNumber || p.tracking_number || shipmentId,
        title: p.customTitle || p.title || p.companyName,
        current_status: p.status || p.current_status || 'transit',
        sender: p.origin || 'Gönderici',
        receiver: defaultReceiverAddr,
        last_location: `${activeDefaultAddress?.district || 'Beşiktaş'} Dağıtım Bölgesi, ${activeDefaultAddress?.city || 'İstanbul'}`,
        estimated_delivery: p.deliveryDateValue || 'Yakında',
        courier_companies: { name: p.companyName || 'Kargo' },
      };
    }

    if (shipmentId && shipmentId !== 'demo' && !mockShipmentDetailsMap[shipmentId]) {
      const trackingCode = route.params?.trackingNumber || shipmentId;
      const carrierMatch = getCarrierByName(route.params?.companyName || '', trackingCode);
      return {
        id: shipmentId,
        tracking_number: trackingCode,
        title: route.params?.title || `${carrierMatch?.name || 'Kargo'} Paketi`,
        current_status: 'transit',
        sender: 'Satıcı / Gönderici Firma',
        receiver: defaultReceiverAddr,
        last_location: `${activeDefaultAddress?.district || 'Beşiktaş'} Dağıtım Bölgesi, ${activeDefaultAddress?.city || 'İstanbul'}`,
        estimated_delivery: '1-2 Gün İçinde',
        courier_companies: { name: carrierMatch?.name || route.params?.companyName || 'Kargo Firması' },
        shipment_events: [
          { id: 'e1', status: 'Transfer Merkezinde', description: 'Transfer merkezinde işlem görüyor.', location: activeDefaultAddress?.city || 'İstanbul', event_time: 'Bugün, 10:30' },
          { id: 'e2', status: 'Kargo Kabul Edildi', description: 'Gönderici kargoyu şubeye teslim etti.', location: 'Çıkış Şubesi', event_time: 'Dün, 16:00' },
        ]
      };
    }

    return mockShipmentDetailsMap['mock-1'] || {
      id: 'demo',
      tracking_number: shipmentId || 'TY7382910482',
      title: 'Trendyol Express Paketim',
      current_status: 'out_for_delivery',
      sender: 'Trendyol Satıcısı',
      receiver: defaultReceiverAddr,
      last_location: `${activeDefaultAddress?.district || 'Beşiktaş'} Dağıtım Bölgesi, ${activeDefaultAddress?.city || 'İstanbul'}`,
      estimated_delivery: 'Bugün, 14:00 - 18:00',
      courier_companies: { name: 'Trendyol Express' },
      shipment_events: [
        { id: 'e1', status: 'Dağıtıma Çıkarıldı', description: 'Kurye teslimat adresinize doğru yola çıktı.', location: `${activeDefaultAddress?.district || 'Beşiktaş'} Şubesi`, event_time: 'Bugün, 09:15' },
        { id: 'e2', status: 'Transfer Merkezinde', description: 'Avrupa Yakası Aktarma Merkezi', location: activeDefaultAddress?.city || 'İstanbul', event_time: 'Dün, 22:45' },
        { id: 'e3', status: 'Sipariş Alındı', description: 'Gönderici kargoyu şubeye teslim etti.', location: 'İzmir', event_time: 'Dün, 14:10' },
      ]
    };
  }, [shipment, userDbShipment, shipmentId, mockShipmentDetailsMap, defaultReceiverAddr, activeDefaultAddress, route.params]);

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
          (ttl && receiverText.includes(ttl)) ||
          (dist && receiverText.includes(dist))
        );
      });
      if (matched) return matched;
    }

    if (receiverText.includes('levent')) {
      return {
        id: 'addr_levent',
        title: 'İş Yeri (Ofis)',
        fullName: currentUserName || 'Kullanıcı',
        phone: '',
        city: 'İstanbul',
        district: 'Levent',
        fullAddress: 'Büyükdere Cad. No:199 K:12, Levent / İstanbul',
        latitude: 41.0778,
        longitude: 29.0112,
        isDefault: false,
      };
    }

    if (receiverText.includes('beşiktaş') || receiverText.includes('besiktas')) {
      return {
        id: 'addr_besiktas',
        title: 'Ev Adresim',
        fullName: currentUserName || 'Kullanıcı',
        phone: '',
        city: 'İstanbul',
        district: 'Beşiktaş',
        fullAddress: 'Cihannüma Mah. Barbaros Bulvarı No:42 D:5, Beşiktaş / İstanbul',
        latitude: 41.0425,
        longitude: 29.0068,
        isDefault: false,
      };
    }

    return activeDefaultAddress;
  }, [displayShipment.receiver, savedAddresses, currentUserName, activeDefaultAddress]);

  const nowMs = Date.now();

  // Alıcı (User) Teslimat Adresi Konumu (Kargonun Kayıtlı Alıcı Adresi)
  const mapDestination: LocationPoint = useMemo(() => {
    const lat = shipmentReceiverAddress?.latitude || 41.0425;
    const lng = shipmentReceiverAddress?.longitude || 29.0068;
    const receiverFullName = currentUserName || (shipmentReceiverAddress?.fullName !== 'Ahmet Yılmaz' ? shipmentReceiverAddress?.fullName : null) || 'Kullanıcı';
    const destTitle = shipmentReceiverAddress?.title
      ? `${shipmentReceiverAddress.title} - ${receiverFullName}`
      : (receiverFullName || 'Teslimat Adresi');

    return {
      latitude: lat,
      longitude: lng,
      title: destTitle,
      description: shipmentReceiverAddress?.fullAddress || displayShipment.receiver || 'Beşiktaş, İstanbul',
      recordedAt: new Date(nowMs).toISOString(),
    };
  }, [shipmentReceiverAddress, displayShipment.receiver, currentUserName, nowMs]);

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
            {/* Top Row: Carrier Company Section on Left, Status Badge on Right */}
            <View style={styles.summaryTopRow}>
              {/* Left: Kargo Firması */}
              <View style={styles.summaryCarrierCol}>
                <Text style={[styles.summarySectionLabel, { color: colors.outline }]}>
                  {t('carrierLabel') || 'KARGO FİRMASI'}
                </Text>
                <View style={styles.summaryCarrierInfo}>
                  {(() => {
                    const carrier = resolveShipmentCarrier(displayShipment);
                    return (
                      <>
                        {carrier.logo ? <CarrierLogo logo={carrier.logo} size={24} /> : null}
                        <Text style={[styles.carrierNameText, { color: colors.onSurface }]} numberOfLines={1}>
                          {carrier.name}
                        </Text>
                      </>
                    );
                  })()}
                </View>
              </View>

              {/* Right: Kargo Durumu */}
              <View style={styles.summaryStatusCol}>
                <Text style={[styles.summarySectionLabel, { color: colors.outline }]}>
                  {t('statusLabel') || 'DURUM'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.secondaryFixed }]}>
                  <MaterialIcons name="notifications-active" size={13} color={colors.secondary} />
                  <Text style={[styles.statusBadgeText, { color: colors.onSecondaryFixedVariant }]}>
                    {(() => {
                      const progressInfo = getShipmentProgress(displayShipment.current_status);
                      return t(progressInfo.titleKey as any) || progressInfo.stepTitle;
                    })()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.summaryDivider, { backgroundColor: colors.outlineVariant }]} />

            {/* Main Cargo Info: Title & Tracking Number */}
            <View style={styles.summaryBottomContent}>
              {displayShipment.title ? (
                <Text style={[styles.summaryTitle, { color: colors.onSurface }]} numberOfLines={2}>
                  {displayShipment.title}
                </Text>
              ) : null}
              <View style={styles.trackingNumberRow}>
                <Text style={[styles.trackingNumberLabel, { color: colors.outline }]}>
                  {t('trackingNumberLabel') || 'TAKİP NO'}:
                </Text>
                <Text style={[styles.trackingNumber, { color: colors.primary }]}>
                  {displayShipment.tracking_number}
                </Text>
              </View>
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
                    {(() => {
                      let raw = displayShipment.receiver || defaultReceiverAddr;
                      if (currentUserName && (raw.includes('Ahmet Yılmaz') || raw.includes('Ahmet Yıldız'))) {
                        raw = raw.replace(/Ahmet\s+Yılmaz/gi, currentUserName).replace(/Ahmet\s+Yıldız/gi, currentUserName);
                      }
                      return raw;
                    })()}
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
                {(() => {
                  const eventsList = displayShipment.shipment_events || displayShipment.events || [];
                  if (eventsList.length === 0) {
                    return <Text style={[styles.timelineDescription, { color: colors.onSurfaceVariant }]}>{t('noEvents')}</Text>;
                  }
                  return eventsList.map((event: any, index: number) => {
                    const translated = translateTimelineEvent({
                      ...event,
                      status: event.status || event.title || '',
                    }, t);
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
                  });
                })()}
              </View>
            </View>
            
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default PackageDetailScreen;
