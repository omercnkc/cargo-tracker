import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

import { CarrierLogo } from '../common/CarrierLogo';
import { getCarrierByName } from '../../constants/carriers';
import { getShipmentProgress } from '../../utils/shipmentUtils';
import { CargoStatusTracker } from '../common/CargoStatusTracker';

interface PackageCardProps {
  id: string;
  name: string;
  code: string;
  status: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  logo?: any;
  isLargeScreen: boolean;
  onPress: () => void;
}

export const PackageCard = ({ name, code, status, icon, logo, isLargeScreen, onPress }: PackageCardProps) => {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const carrierLogo = logo || getCarrierByName(name, code)?.logo;
  const progressInfo = getShipmentProgress(status);

  const isDelivered = progressInfo.stepIndex === 5;
  const isPending = progressInfo.stepIndex === 0;

  const statusConfig = {
    color: isDelivered
      ? (colors.status?.delivered?.text || '#166534')
      : isPending
      ? (colors.status?.pending?.text || '#1E3A8A')
      : (colors.status?.inTransit?.text || '#9A3412'),
    bg: isDelivered
      ? (colors.status?.delivered?.background || '#DCFCE7')
      : isPending
      ? (colors.status?.pending?.background || '#EFF4FF')
      : (colors.status?.inTransit?.background || '#FFEDD5'),
  };

  return (
    <TouchableOpacity 
      style={[
        styles.packageCard, 
        { 
          backgroundColor: colors.surfaceContainerLowest, 
          borderColor: colors.outlineVariant, 
          shadowColor: colors.primaryContainer 
        }, 
        isDelivered && { opacity: 0.85 }
      ]} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.packageInfoWrapper}>
          <View style={[styles.packageIconBg, { backgroundColor: colors.surfaceVariant }]}>
            {carrierLogo ? (
              <CarrierLogo logo={carrierLogo} size={28} />
            ) : (
              <MaterialIcons name={icon || 'local-shipping'} size={24} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.packageName, { color: colors.onBackground }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.packageCode, { color: colors.onSurfaceVariant }]}>{code}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
            {progressInfo.stepTitle}
          </Text>
        </View>
      </View>
      
      {/* Animated 6-Step Cargo Status Road Tracker */}
      <View style={styles.trackerContainer}>
        <CargoStatusTracker
          status={status}
          compact={!isLargeScreen}
          showLabels={isLargeScreen}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  packageCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  packageInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  packageIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageName: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
  },
  packageCode: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  trackerContainer: {
    width: '100%',
    marginTop: 4,
  },
});

export default PackageCard;
