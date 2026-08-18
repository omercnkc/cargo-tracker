import React, { useMemo, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getCarrierByName, resolveShipmentCarrier } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { getShipmentProgress, translateTimelineEvent } from '../utils/shipmentUtils';
import { hapticService } from '../services/haptics.service';
import { UserAddress } from '../components/profile/AddAddressModal';

const DEFAULT_ACTIVE_ADDRESS: UserAddress = {
  id: 'addr_default_1',
  title: 'Ev Adresim',
  fullName: 'Ahmet Yılmaz',
  phone: '0555 123 45 67',
  city: 'İstanbul',
  district: 'Beşiktaş',
  fullAddress: 'Cihannüma Mah. Barbaros Bulvarı No:42 D:5, Beşiktaş / İstanbul',
  latitude: 41.0425,
  longitude: 29.0068,
  isDefault: true,
};

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

  // User's saved addresses list
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([DEFAULT_ACTIVE_ADDRESS]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const stored = await AsyncStorage.getItem('@cargo_tracker_user_addresses');
        if (stored) {
          const list: UserAddress[] = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            setSavedAddresses(list);
          }
        }
      } catch (e) {
        console.error('Error loading addresses in PackageDetailScreen:', e);
      }
    };

    loadAddresses();
  }, []);

  // Supabase Realtime Canlı Takip Hook'u
  useShipmentRealtime(shipmentId);

  // Active default address
  const activeDefaultAddress = useMemo(() => {
    return savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || DEFAULT_ACTIVE_ADDRESS;
  }, [savedAddresses]);

  // Dynamic mock map for all sample packages
  const mockShipmentDetailsMap = useMemo<Record<string, any>>(() => {
    const receiverName = activeDefaultAddress?.fullName || 'Ahmet Yılmaz';
    const receiverAddr = activeDefaultAddress ? `${activeDefaultAddress.fullName}\n${activeDefaultAddress.fullAddress}` : 'Ahmet Yılmaz\nBeşiktaş, İstanbul';
    const currentLoc = `${activeDefaultAddress?.district || 'Beşiktaş'} Dağıtım Bölgesi, ${activeDefaultAddress?.city || 'İstanbul'}`;

    return {
      'mock-1': {
        id: 'mock-1',
        tracking_number: 'TY7382910482',
        title: 'Kablosuz Kulaklık & Koruma Kılıfı',
        current_status: 'out_for_delivery',
        sender: 'Trendyol Tech Mağazası',
        receiver: receiverAddr,
        last_location: currentLoc,
        estimated_delivery: 'Bugün, 14:00 - 18:00',
        courier_companies: { name: 'Trendyol Express' },
        shipment_events: [
          { id: 'e1', status: 'Kurye Dağıtımda', description: 'Kurye teslimat adresinize doğru yola çıktı.', location: `${activeDefaultAddress?.district || 'Beşiktaş'} Dağıtım Merkezi`, event_time: 'Bugün, 10:30' },
          { id: 'e2', status: 'Varış Şubesinde', description: 'Paket dağıtım şubesine ulaştı ve zimmetlendi.', location: `${activeDefaultAddress?.district || 'Beşiktaş'} Şubesi`, event_time: 'Bugün, 07:45' },
          { id: 'e3', status: 'Transfer Merkezinde', description: 'Ana aktarma merkezinden varış şubesine sevk edildi.', location: 'İstanbul Aktarma', event_time: 'Dün, 23:10' },
          { id: 'e4', status: 'Kargo Kabul Edildi', description: 'Gönderici kargoyu teslim etti.', location: 'İzmir Şube', event_time: 'Dün, 14:20' },
        ]
      },
      'mock-2': {
        id: 'mock-2',
        tracking_number: 'HJ9482019384',
        title: 'Mekanik Oyuncu Klavyesi',
        current_status: 'transit',
        sender: 'Hepsiburada Satıcısı',
        receiver: receiverAddr,
        last_location: 'Bolu - Düzce Otoyol Hattı',
        estimated_delivery: 'Yarın, 10:00 - 14:00',
        courier_companies: { name: 'Hepsijet' },
        shipment_events: [
          { id: 'e1', status: 'Yolda', description: 'Transfer tırı varış merkezine hareket etti.', location: 'Bolu Aktarma', event_time: 'Bugün, 06:15' },
          { id: 'e2', status: 'Transfer Merkezinde', description: 'Paket ayrıştırma bandından geçirildi.', location: 'Ankara Lojistik Merkezi', event_time: 'Dün, 21:30' },
          { id: 'e3', status: 'Çıkış Şubesinde', description: 'Paket kurye tarafından teslim alındı.', location: 'Ankara Çankaya', event_time: 'Dün, 16:00' },
        ]
      },
      'mock-3': {
        id: 'mock-3',
        tracking_number: 'YK8473920194',
        title: 'Deri Sırt Çantası & Cüzdan',
        current_status: 'destination',
        sender: 'Moda Deri Tasarım A.Ş.',
        receiver: receiverAddr,
        last_location: `${activeDefaultAddress?.district || 'Beşiktaş'} Şubesi`,
        estimated_delivery: 'Bugün Dağıtım Bekliyor',
        courier_companies: { name: 'Yurtiçi Kargo' },
        shipment_events: [
          { id: 'e1', status: 'Varış Şubesinde', description: 'Paket varış şubesinde teslimat sırasına alındı.', location: `${activeDefaultAddress?.district || 'Beşiktaş'} Şubesi`, event_time: 'Bugün, 08:20' },
          { id: 'e2', status: 'Transfer Merkezinde', description: 'Marmara Aktarma Merkezinden şubeye ulaştı.', location: 'İstanbul Aktarma', event_time: 'Bugün, 03:40' },
          { id: 'e3', status: 'Gönderici Şubede', description: 'Kargo kabulü yapıldı.', location: 'Bursa Heykel Şubesi', event_time: 'Dün, 17:15' },
        ]
      },
      'mock-4': {
        id: 'mock-4',
        tracking_number: 'AR2948103947',
        title: 'Koşu Ayakkabısı (42 Numara)',
        current_status: 'delivered',
        sender: 'SporStore Online',
        receiver: receiverAddr,
        last_location: 'Teslim Edildi',
        estimated_delivery: 'Dün, 16:30',
        delivered_at: 'Dün, 16:30',
        courier_companies: { name: 'Aras Kargo' },
        shipment_events: [
          { id: 'e1', status: 'Teslim Edildi', description: `Alıcıya teslim edildi: ${receiverName}`, location: `${activeDefaultAddress?.district || 'Beşiktaş'}`, event_time: 'Dün, 16:30' },
          { id: 'e2', status: 'Dağıtıma Çıkarıldı', description: 'Kurye teslimat için adrese yöneldi.', location: `${activeDefaultAddress?.district || 'Beşiktaş'} Şubesi`, event_time: 'Dün, 11:00' },
          { id: 'e3', status: 'Varış Şubesinde', description: 'Paket şubeye giriş yaptı.', location: `${activeDefaultAddress?.district || 'Beşiktaş'} Şubesi`, event_time: 'Dün, 08:30' },
          { id: 'e4', status: 'Sipariş Alındı', description: 'Gönderici kargoyu teslim etti.', location: 'İstanbul Kadıköy', event_time: '2 Gün Önce, 15:45' },
        ]
      },
      'mock-5': {
        id: 'mock-5',
        tracking_number: 'SK1928374650',
        title: 'Yazılım & Tasarım Kitapları',
        current_status: 'created',
        sender: 'Akademi Kitabevi',
        receiver: receiverAddr,
        last_location: 'Gönderici Hazırlık Aşamasında',
        estimated_delivery: 'Sipariş Hazırlanıyor',
        courier_companies: { name: 'Sürat Kargo' },
        shipment_events: [
          { id: 'e1', status: 'Sipariş Oluşturuldu', description: 'Kargo barkodu oluşturuldu, kurye alımı bekleniyor.', location: 'Ankara Kızılay', event_time: 'Bugün, 11:20' },
        ]
      },
      'mock-6': {
        id: 'mock-6',
        tracking_number: 'KG8392019381',
        title: 'Filtre Kahve Çekirdeği 1KG',
        current_status: 'received',
        sender: 'Roastery Coffee Co.',
        receiver: receiverAddr,
        last_location: 'İstanbul Levent Şubesi',
        estimated_delivery: '2 Gün İçinde',
        courier_companies: { name: 'Kargoist' },
        shipment_events: [
          { id: 'e1', status: 'Şubede Kabul Edildi', description: 'Gönderi şube tarafından teslim alındı.', location: 'İstanbul Levent Şubesi', event_time: 'Dün, 17:50' },
          { id: 'e2', status: 'Sipariş Onaylandı', description: 'Satıcı kargo kaydını açtı.', location: 'İstanbul', event_time: 'Dün, 15:10' },
        ]
      },
      'mock-7': {
        id: 'mock-7',
        tracking_number: 'DHL9382019283',
        title: 'Yurt Dışı Yazılım Geliştirici Kiti',
        current_status: 'transit',
        sender: 'DevHardware Europe GmbH',
        receiver: receiverAddr,
        last_location: 'İstanbul Havalimanı Gümrük Noktası',
        estimated_delivery: '3 Gün İçinde',
        courier_companies: { name: 'DHL Express' },
        shipment_events: [
          { id: 'e1', status: 'Gümrük İşlemleri Tamamlandı', description: 'Paket gümrükten geçti ve iç hat sevkiyatına verildi.', location: 'İstanbul Havalimanı (IST)', event_time: 'Bugün, 07:10' },
          { id: 'e2', status: 'Uçuş Gerçekleşti', description: 'Frankfurt - İstanbul kargo uçuşu tamamlandı.', location: 'Frankfurt Hub (FRA)', event_time: 'Dün, 22:30' },
          { id: 'e3', status: 'Uluslararası Çıkış Yapıldı', description: 'Kargo tesisinde çıkış taraması yapıldı.', location: 'Almanya', event_time: '2 Gün Önce, 14:00' },
        ]
      },
      'mock-8': {
        id: 'mock-8',
        tracking_number: 'FDX0928374619',
        title: 'Akıllı Ev Sensör Paketi',
        current_status: 'delivered',
        sender: 'SmartHome Global BV',
        receiver: receiverAddr,
        last_location: 'Teslim Edildi',
        estimated_delivery: '3 Gün Önce Teslim Edildi',
        delivered_at: '3 Gün Önce',
        courier_companies: { name: 'FedEx' },
        shipment_events: [
          { id: 'e1', status: 'Teslim Edildi', description: `Teslim Alan: ${receiverName} (İmza ile teslim edildi)`, location: `${activeDefaultAddress?.district || 'Beşiktaş'}`, event_time: '3 Gün Önce, 14:15' },
          { id: 'e2', status: 'Dağıtıma Çıkarıldı', description: 'Kurye aracı adrese yöneldi.', location: 'İstanbul FedEx Dağıtım', event_time: '3 Gün Önce, 09:40' },
          { id: 'e3', status: 'Gümrükten Çıktı', description: 'İthalat gümrükleme onaylandı.', location: 'İstanbul Havalimanı', event_time: '4 Gün Önce, 16:00' },
        ]
      },
    };
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
