import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomMarker } from './CustomMarker';
import { LocationPoint, getLatest15MinDelayedLocation } from '../../types/location';
import { useTranslation } from '../../hooks/useTranslation';

interface ShipmentMapViewProps {
  destination: LocationPoint;
  rawCourierLocations?: LocationPoint[];
  height?: number;
  onExpandFullScreen?: () => void;
}

export function ShipmentMapView({
  destination,
  rawCourierLocations = [],
  height = 240,
  onExpandFullScreen,
}: ShipmentMapViewProps) {
  const { t, language } = useTranslation();

  // Kurye güvenliği için 15 dakika gecikmeli en son konumu al
  const delayedCourierLocation = useMemo(() => {
    if (!rawCourierLocations || rawCourierLocations.length === 0) return undefined;
    return getLatest15MinDelayedLocation(rawCourierLocations);
  }, [rawCourierLocations]);

  // Haritanın merkez bölgesi (Kurye ve Alıcı adresini ortalar)
  const initialRegion = useMemo(() => {
    if (!delayedCourierLocation) {
      return {
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
    }

    const midLat = (destination.latitude + delayedCourierLocation.latitude) / 2;
    const midLng = (destination.longitude + delayedCourierLocation.longitude) / 2;

    const latDelta = Math.max(Math.abs(destination.latitude - delayedCourierLocation.latitude) * 1.6, 0.02);
    const lngDelta = Math.max(Math.abs(destination.longitude - delayedCourierLocation.longitude) * 1.6, 0.02);

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [delayedCourierLocation, destination]);

  const locale = language === 'en' ? 'en-US' : 'tr-TR';

  return (
    <View style={[styles.container, { height }]}>
      {/* 15 Dakika Kurye Güvenliği Rozeti (Safety Badge) */}
      <View style={styles.securityBadge}>
        <MaterialIcons name="security" size={16} color="#047857" style={styles.securityIcon} />
        <Text style={styles.securityText}>
          {t('courierSafetyNotice')}
        </Text>
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsCompass={true}
      >
        {/* 🚚 15 Dakika Gecikmeli Kurye Markeri */}
        {delayedCourierLocation && (
          <CustomMarker
            location={delayedCourierLocation}
            type="courier"
            title={t('courierLocationTitle')}
            description={`${t('lastSecureRecord')}: ${new Date(delayedCourierLocation.recordedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`}
          />
        )}

        {/* 🏡 Alıcı (User / Teslimat Adresi) Marker */}
        <CustomMarker
          location={destination}
          type="destination"
          title={t('deliveryAddressTitle')}
          description={destination.description || destination.title || t('destinationAddressDesc')}
        />
      </MapView>

      {/* Tam Ekran Büyütme Butonu */}
      {onExpandFullScreen && (
        <TouchableOpacity style={styles.expandButton} onPress={onExpandFullScreen} activeOpacity={0.8}>
          <MaterialIcons name="fullscreen" size={22} color="#00236f" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginVertical: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  securityBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  securityIcon: {
    marginRight: 6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
    flex: 1,
  },
  expandButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
