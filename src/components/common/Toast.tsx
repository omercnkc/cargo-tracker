import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  title,
  type = 'info',
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!visible && (translateY as any)._value === -120) {
    return null;
  }

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          bgColor: '#064e3b',
          borderColor: '#10b981',
          textColor: '#ecfdf5',
          iconColor: '#34d399',
          defaultTitle: 'Başarılı',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          bgColor: '#78350f',
          borderColor: '#f59e0b',
          textColor: '#fffbeb',
          iconColor: '#fbbf24',
          defaultTitle: 'Uyarı',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          bgColor: '#7f1d1d',
          borderColor: '#ef4444',
          textColor: '#fef2f2',
          iconColor: '#f87171',
          defaultTitle: 'Hata',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          bgColor: '#1e3a8a',
          borderColor: '#3b82f6',
          textColor: '#eff6ff',
          iconColor: '#60a5fa',
          defaultTitle: 'Bilgi',
        };
    }
  };

  const config = getConfig();
  const displayTitle = title || config.defaultTitle;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 12) + 8,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <Ionicons
          name={config.icon}
          size={24}
          color={config.iconColor}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          {displayTitle ? (
            <Text style={[styles.title, { color: config.textColor }]}>
              {displayTitle}
            </Text>
          ) : null}
          <Text style={[styles.message, { color: config.textColor }]}>
            {message}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onHide}
          style={styles.closeBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={config.textColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
