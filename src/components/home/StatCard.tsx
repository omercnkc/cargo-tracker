import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  variant: 'small' | 'large';
  isLargeScreen?: boolean;
}

export const StatCard = ({ label, value, icon, variant, isLargeScreen }: StatCardProps) => {
  const { theme: colors } = useTheme();

  if (variant === 'large') {
    return (
      <View style={[
        styles.statCard, 
        styles.statCardLarge, 
        { backgroundColor: colors.primaryContainer, borderColor: colors.primaryFixed },
        isLargeScreen && styles.statCardLargeDesktop
      ]}>
        <View style={styles.statCardBgIcon}>
          <MaterialIcons name={icon} size={80} color={colors.onPrimaryContainer} />
        </View>
        <View style={styles.statIconWrapper}>
          <MaterialIcons name={icon} size={24} color={colors.onPrimaryContainer} />
        </View>
        <View>
          <Text style={[styles.statLabelLight, { color: colors.onPrimaryContainer }]}>{label}</Text>
          <Text style={[styles.statValueLight, { color: colors.onPrimary }]}>{value}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.statCard, 
      styles.statCardSmall, 
      { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant, shadowColor: colors.primaryContainer }
    ]}>
      <View style={styles.statIconWrapper}>
        <MaterialIcons name={icon} size={24} color={colors.tertiaryFixedDim} />
      </View>
      <View>
        <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.statValue, { color: colors.onBackground }]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 12,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statCardSmall: {
    flex: 1,
    minWidth: '45%',
  },
  statCardLarge: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    shadowOpacity: 0.12,
  },
  statCardLargeDesktop: {
    flex: 1,
  },
  statIconWrapper: {
    marginBottom: 16,
  },
  statCardBgIcon: {
    position: 'absolute',
    right: -16,
    top: -16,
    opacity: 0.2,
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statLabelLight: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  statValueLight: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default StatCard;
