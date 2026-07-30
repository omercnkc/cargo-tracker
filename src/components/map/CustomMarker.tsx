import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { LocationPoint } from '../../types/location';

interface CustomMarkerProps {
  location: LocationPoint;
  type: 'origin' | 'destination' | 'courier' | 'hub';
  title?: string;
  description?: string;
}

export function CustomMarker({ location, type, title, description }: CustomMarkerProps) {
  const getMarkerConfig = () => {
    switch (type) {
      case 'origin':
        return { icon: 'unarchive' as const, color: '#3b82f6', bgColor: '#dbeafe' };
      case 'destination':
        return { icon: 'home' as const, color: '#10b981', bgColor: '#d1fae5' };
      case 'courier':
        return { icon: 'local-shipping' as const, color: '#f59e0b', bgColor: '#fef3c7' };
      case 'hub':
      default:
        return { icon: 'store-mall-directory' as const, color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  const config = getMarkerConfig();

  return (
    <Marker
      coordinate={{ latitude: location.latitude, longitude: location.longitude }}
      title={title || location.title}
      description={description || location.description}
    >
      <View style={[styles.markerContainer, { backgroundColor: config.bgColor, borderColor: config.color }]}>
        <MaterialIcons name={config.icon} size={20} color={config.color} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
