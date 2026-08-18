import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './InlineErrorBanner.styles';
import { useTheme } from '../../theme/useTheme';

export interface InlineErrorBannerProps {
  message: string;
  title?: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  onDismiss?: () => void;
  onRetry?: () => void;
  style?: object;
}

export const InlineErrorBanner: React.FC<InlineErrorBannerProps> = ({
  message,
  title,
  type = 'warning',
  onDismiss,
  onRetry,
  style,
}) => {
  const { isDarkMode } = useTheme();

  if (!message) return null;

  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'alert-circle-outline' as const,
          bgColor: isDarkMode ? '#450a0a' : '#fef2f2',
          borderColor: isDarkMode ? '#991b1b' : '#fca5a5',
          textColor: isDarkMode ? '#fca5a5' : '#991b1b',
          iconColor: isDarkMode ? '#f87171' : '#dc2626',
        };
      case 'warning':
        return {
          icon: 'warning-outline' as const,
          bgColor: isDarkMode ? '#451a03' : '#fffbeb',
          borderColor: isDarkMode ? '#b45309' : '#fde68a',
          textColor: isDarkMode ? '#fde68a' : '#92400e',
          iconColor: isDarkMode ? '#fbbf24' : '#d97706',
        };
      case 'success':
        return {
          icon: 'checkmark-circle-outline' as const,
          bgColor: isDarkMode ? '#064e3b' : '#f0fdf4',
          borderColor: isDarkMode ? '#047857' : '#bbf7d0',
          textColor: isDarkMode ? '#a7f3d0' : '#166534',
          iconColor: isDarkMode ? '#34d399' : '#16a34a',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle-outline' as const,
          bgColor: isDarkMode ? '#1e3a8a' : '#eff6ff',
          borderColor: isDarkMode ? '#2563eb' : '#bfdbfe',
          textColor: isDarkMode ? '#dbeafe' : '#1e40af',
          iconColor: isDarkMode ? '#60a5fa' : '#2563eb',
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <Ionicons
        name={config.icon}
        size={20}
        color={config.iconColor}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        {title ? (
          <Text style={[styles.title, { color: config.textColor }]}>
            {title}
          </Text>
        ) : null}
        <Text style={[styles.message, { color: config.textColor }]}>
          {message}
        </Text>
      </View>

      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryBtn, { backgroundColor: config.borderColor }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.retryText, { color: config.textColor }]}>
            Dene
          </Text>
        </TouchableOpacity>
      ) : null}

      {onDismiss ? (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={config.textColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default InlineErrorBanner;
