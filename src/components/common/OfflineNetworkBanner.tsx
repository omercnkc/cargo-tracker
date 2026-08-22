import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { hapticService } from '../../services/haptics.service';
import { styles } from './OfflineNetworkBanner.styles';

export const OfflineNetworkBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isOnline, pendingCount } = useNetworkStatus();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const [visible, setVisible] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const wasOffline = useRef(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showBanner = () => {
    setVisible(true);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBanner = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setJustReconnected(false);
      if (callback) callback();
    });
  };

  useEffect(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (!isOnline) {
      // Offline transition
      wasOffline.current = true;
      setJustReconnected(false);
      showBanner();
      hapticService.warning();
    } else if (wasOffline.current) {
      // Online reconnected transition
      setJustReconnected(true);
      hapticService.success();
      showBanner();

      // Auto dismiss after 2.8 seconds
      hideTimeoutRef.current = setTimeout(() => {
        hideBanner(() => {
          wasOffline.current = false;
        });
      }, 2800);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isOnline]);

  if (!visible) return null;

  const topInset = Math.max(insets.top + 8, 16);

  // Theme colors for Offline vs Reconnected state
  const isOfflineState = !isOnline;

  const bgColor = isOfflineState
    ? (isDarkMode ? '#451a03' : '#fffbeb')
    : (isDarkMode ? '#064e3b' : '#f0fdf4');

  const borderColor = isOfflineState
    ? (isDarkMode ? '#b45309' : '#fde68a')
    : (isDarkMode ? '#059669' : '#bbf7d0');

  const iconBg = isOfflineState
    ? (isDarkMode ? '#78350f' : '#fef3c7')
    : (isDarkMode ? '#065f46' : '#dcfce7');

  const iconColor = isOfflineState
    ? (isDarkMode ? '#fbbf24' : '#d97706')
    : (isDarkMode ? '#34d399' : '#16a34a');

  const titleColor = isOfflineState
    ? (isDarkMode ? '#fef3c7' : '#92400e')
    : (isDarkMode ? '#ecfdf5' : '#15803d');

  const descColor = isOfflineState
    ? (isDarkMode ? '#fde68a' : '#b45309')
    : (isDarkMode ? '#a7f3d0' : '#166534');

  const badgeBg = isOfflineState
    ? (isDarkMode ? '#92400e' : '#fde68a')
    : (isDarkMode ? '#047857' : '#bbf7d0');

  const badgeText = isOfflineState
    ? (isDarkMode ? '#fff' : '#78350f')
    : (isDarkMode ? '#fff' : '#14532d');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topInset,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => hideBanner()}
        style={[
          styles.bannerContent,
          {
            backgroundColor: bgColor,
            borderColor,
          },
        ]}
      >
        <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
          <MaterialIcons
            name={isOfflineState ? 'wifi-off' : 'wifi'}
            size={20}
            color={iconColor}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.titleText, { color: titleColor }]}>
              {isOfflineState ? t('offlineBannerTitle') : t('onlineBannerTitle')}
            </Text>
            {isOfflineState && pendingCount > 0 && (
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeText }]}>
                  {t('offlinePendingBadge', { count: pendingCount })}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.descText, { color: descColor }]} numberOfLines={2}>
            {isOfflineState ? t('offlineBannerDesc') : t('onlineBannerDesc')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => hideBanner()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeBtn}
        >
          <MaterialIcons name="close" size={18} color={iconColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};
