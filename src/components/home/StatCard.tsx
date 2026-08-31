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
          <MaterialIcons name={icon} size={52} color={colors.onPrimaryContainer} />
        </View>
        <View style={styles.statIconWrapper}>
          <MaterialIcons name={icon} size={20} color={colors.onPrimaryContainer} />
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
        <MaterialIcons name={icon} size={20} color={colors.tertiaryFixedDim} />
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
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
    shadowOpacity: 0.1,
  },
  statCardLargeDesktop: {
    flex: 1,
  },
  statIconWrapper: {
    marginBottom: 6,
  },
  statCardBgIcon: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.2,
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statLabelLight: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  statValueLight: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default StatCard;
