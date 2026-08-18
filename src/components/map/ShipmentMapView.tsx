import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomMarker } from './CustomMarker';
import { LocationPoint } from '../../types/location';
import { useTranslation } from '../../hooks/useTranslation';

interface ShipmentMapViewProps {
  destination: LocationPoint;
  height?: number;
  onExpandFullScreen?: () => void;
}

export function ShipmentMapView({
  destination,
  height = 240,
  onExpandFullScreen,
}: ShipmentMapViewProps) {
  const { t } = useTranslation();

  // Haritanın merkez bölgesi: Kullanıcının aktif teslimat adresine net ve odaklı zoom
  const initialRegion = useMemo(() => {
    return {
      latitude: destination.latitude,
      longitude: destination.longitude,
      latitudeDelta: 0.007,
      longitudeDelta: 0.007,
    };
  }, [destination.latitude, destination.longitude]);

  return (
    <View style={[styles.container, { height }]}>
      {/* Aktif Teslimat Adresi Rozeti */}
      <View style={styles.addressBadge}>
        <MaterialIcons name="place" size={16} color="#00236f" style={styles.addressIcon} />
        <Text style={styles.addressBadgeTitle} numberOfLines={1}>
          {destination.title || t('deliveryAddressTitle')}
        </Text>
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        region={initialRegion}
        showsUserLocation={false}
        showsCompass={true}
      >
        {/* 🏡 Alıcı (User / Teslimat Adresi) Markeri */}
        <CustomMarker
          location={destination}
          type="destination"
          title={destination.title || t('deliveryAddressTitle')}
          description={destination.description || t('destinationAddressDesc')}
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
  addressBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
    gap: 6,
  },
  addressIcon: {
    marginRight: 2,
  },
  addressBadgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00236f',
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
