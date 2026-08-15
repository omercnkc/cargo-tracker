import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MutationStatus } from '../types/offline.types';

interface SyncBadgeProps {
  status?: MutationStatus | 'synced';
  size?: 'small' | 'medium';
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ status = 'pending', size = 'medium' }) => {
  if (status === 'synced') {
    return null; // Synced items need no badge
  }

  const getBadgeStyle = () => {
    switch (status) {
      case 'pending':
        return {
          bgColor: '#FEF9C3',
          textColor: '#854D0E',
          borderColor: '#FDE047',
          icon: '⏳',
          text: 'Senkronize Bekliyor',
        };
      case 'conflict':
        return {
          bgColor: '#FFEDD5',
          textColor: '#9A3412',
          borderColor: '#FDBA74',
          icon: '⚠️',
          text: 'Çakışma - Çözüm Bekliyor',
        };
      case 'dead':
      case 'failed':
        return {
          bgColor: '#FEE2E2',
          textColor: '#991B1B',
          borderColor: '#FCA5A5',
          icon: '🚫',
          text: 'Hata - Başarısız',
        };
      case 'blocked':
        return {
          bgColor: '#F3F4F6',
          textColor: '#374151',
          borderColor: '#D1D5DB',
          icon: '⛔',
          text: 'Engellendi',
        };
      default:
        return {
          bgColor: '#F3F4F6',
          textColor: '#374151',
          borderColor: '#D1D5DB',
          icon: '⏳',
          text: 'İşleniyor',
        };
    }
  };

  const badgeConfig = getBadgeStyle();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeConfig.bgColor,
          borderColor: badgeConfig.borderColor,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
      ]}
      testID="sync-badge"
    >
      <Text style={[styles.icon, { fontSize: isSmall ? 10 : 12 }]}>{badgeConfig.icon}</Text>
      <Text
        style={[
          styles.text,
          { color: badgeConfig.textColor, fontSize: isSmall ? 10 : 12 },
        ]}
      >
        {badgeConfig.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});
