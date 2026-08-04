import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

import { CarrierLogo } from '../common/CarrierLogo';
import { getCarrierByName } from '../../constants/carriers';

interface PackageCardProps {
  id: string;
  name: string;
  code: string;
  status: 'transit' | 'delivered' | 'pending';
  icon?: keyof typeof MaterialIcons.glyphMap;
  logo?: any;
  isLargeScreen: boolean;
  onPress: () => void;
}

export const PackageCard = ({ name, code, status, icon, logo, isLargeScreen, onPress }: PackageCardProps) => {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const carrierLogo = logo || getCarrierByName(name, code)?.logo;

  const statusConfig = {
    transit: {
      label: t('statusInTransit'),
      color: colors.onSecondaryFixedVariant,
      bg: colors.secondaryFixed,
      progress: '66%',
    },
    delivered: {
      label: t('statusDelivered'),
      color: colors.onSurfaceVariant,
      bg: colors.surfaceContainerHigh,
      progress: '100%',
    },
    pending: {
      label: t('statusPending'),
      color: colors.onTertiaryFixedVariant,
      bg: colors.tertiaryFixed,
      progress: '33%',
    }
  };

  const config = statusConfig[status];

  return (
    <TouchableOpacity 
      style={[
        styles.packageCard, 
        { 
          backgroundColor: colors.surfaceContainerLowest, 
          borderColor: colors.outlineVariant, 
          shadowColor: colors.primaryContainer 
        }, 
        status === 'delivered' && { opacity: 0.8 }
      ]} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.packageInfoWrapper}>
        <View style={[styles.packageIconBg, { backgroundColor: colors.surfaceVariant }]}>
          {carrierLogo ? (
            <CarrierLogo logo={carrierLogo} size={28} />
          ) : (
            <MaterialIcons name={icon || 'local-shipping'} size={24} color={colors.primary} />
          )}
        </View>
        <View>
          <Text style={[styles.packageName, { color: colors.onBackground }]}>{name}</Text>
          <Text style={[styles.packageCode, { color: colors.onSurfaceVariant }]}>{code}</Text>
        </View>
      </View>
      
      <View style={styles.packageStatusWrapper}>
        {!isLargeScreen && (
          <View style={[styles.mobileProgressLine, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.mobileProgressFill, { width: config.progress as any, backgroundColor: config.color }]} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      
      {isLargeScreen && status === 'transit' && (
        <View style={styles.desktopStepper}>
          <View style={[styles.stepperLine, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.stepperLineFill, { width: '66%', backgroundColor: colors.tertiaryFixedDim }]} />
            <View style={[styles.stepperDot, { left: 0, backgroundColor: colors.tertiaryFixedDim }]} />
            <View style={[styles.stepperDot, { left: '33%', backgroundColor: colors.tertiaryFixedDim }]} />
            <View style={[styles.stepperDot, { left: '66%', backgroundColor: colors.secondaryContainer, borderWidth: 4, borderColor: colors.surfaceContainerLowest, width: 16, height: 16, top: -6 }]} />
            <View style={[styles.stepperDot, { right: 0, backgroundColor: colors.surfaceVariant }]} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  packageCard: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  packageInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  packageIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  packageCode: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    marginTop: 2,
  },
  packageStatusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileProgressLine: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 16,
    overflow: 'hidden',
  },
  mobileProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  desktopStepper: {
    flex: 1,
    marginHorizontal: 32,
    justifyContent: 'center',
  },
  stepperLine: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
    width: '100%',
  },
  stepperLineFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 2,
  },
  stepperDot: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default PackageCard;
