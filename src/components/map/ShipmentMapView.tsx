import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OpenStreetMapLeaflet } from './OpenStreetMapLeaflet';
import { LocationPoint } from '../../types/location';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../theme/useTheme';

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
  const { theme: colors, isDarkMode } = useTheme();
  const [hasMapError, setHasMapError] = useState(false);

  // Yerel Harita Uygulamasında (Google Maps / Apple Maps) açma fonksiyonu
  const handleOpenExternalMap = () => {
    const lat = destination.latitude;
    const lng = destination.longitude;
    const label = encodeURIComponent(destination.title || 'Teslimat Adresi');

    const scheme = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });
    const webFallback = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    if (scheme) {
      Linking.canOpenURL(scheme)
        .then((supported) => {
          if (supported) {
            Linking.openURL(scheme);
          } else {
            Linking.openURL(webFallback);
          }
        })
        .catch(() => {
          Linking.openURL(webFallback);
        });
    } else {
      Linking.openURL(webFallback);
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        height, 
        backgroundColor: isDarkMode ? colors.surfaceContainer : '#f8fafc',
        borderColor: colors.outlineVariant,
      }
    ]}>
      {/* Aktif Teslimat Adresi Rozeti */}
      <View style={[
        styles.addressBadge,
        { 
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDarkMode ? '#334155' : '#cbd5e1',
        }
      ]}>
        <MaterialIcons name="place" size={16} color={colors.primary} style={styles.addressIcon} />
        <Text style={[styles.addressBadgeTitle, { color: isDarkMode ? '#f8fafc' : colors.primary }]} numberOfLines={1}>
          {destination.title || t('deliveryAddressTitle')}
        </Text>
      </View>

      {/* Harita Gövdesi (OpenStreetMap Leaflet veya Güvenli Fallback) */}
      {!hasMapError ? (
        <OpenStreetMapLeaflet
          latitude={destination.latitude}
          longitude={destination.longitude}
          title={destination.title || t('deliveryAddressTitle')}
          description={destination.description || t('destinationAddressDesc')}
          isDark={isDarkMode}
          zoom={15}
          onError={() => setHasMapError(true)}
        />
      ) : (
        /* Çevrimdışı / Hata Durumu Fallback Kartı */
        <View style={styles.fallbackContainer}>
          <MaterialIcons name="map" size={36} color={colors.primary} />
          <Text style={[styles.fallbackTitle, { color: colors.onSurface }]}>
            {destination.title || t('deliveryAddressTitle')}
          </Text>
          {destination.description ? (
            <Text style={[styles.fallbackDesc, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
              {destination.description}
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.externalMapBtn, { backgroundColor: colors.primary }]}
            onPress={handleOpenExternalMap}
            activeOpacity={0.8}
          >
            <MaterialIcons name="navigation" size={16} color="#ffffff" />
            <Text style={styles.externalMapBtnText}>{t('openInMaps') || 'Haritalarda Aç'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sağ Alt Hızlı Eylemler: Harici Haritada Aç & Tam Ekran */}
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: colors.outlineVariant }
          ]} 
          onPress={handleOpenExternalMap} 
          activeOpacity={0.8}
        >
          <MaterialIcons name="directions" size={18} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>{t('directions') || 'Yol Tarifi'}</Text>
        </TouchableOpacity>

        {onExpandFullScreen && (
          <TouchableOpacity 
            style={[
              styles.iconActionButton, 
              { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: colors.outlineVariant }
            ]} 
            onPress={onExpandFullScreen} 
            activeOpacity={0.8}
          >
            <MaterialIcons name="fullscreen" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    marginVertical: 12,
  },
  addressBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
    borderWidth: 1,
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
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  fallbackDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  externalMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  externalMapBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconActionButton: {
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
