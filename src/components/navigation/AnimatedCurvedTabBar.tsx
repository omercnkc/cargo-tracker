import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { hapticService } from '../../services/haptics.service';

interface AnimatedCurvedTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Home: 'home',
  Packages: 'inventory',
  AddPackage: 'add',
  Statistics: 'leaderboard',
  Profile: 'person',
};

export const AnimatedCurvedTabBar: React.FC<AnimatedCurvedTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'Home': return t('navHome');
      case 'Packages': return t('navPackages');
      case 'AddPackage': return t('navAdd');
      case 'Statistics': return t('navStats');
      case 'Profile': return t('navProfile');
      default: return routeName;
    }
  };

  const bottomInset = Math.max(insets.bottom, 12);
  const barHeight = 64 + bottomInset;

  // Animation values for scale of active tabs
  const scaleAnimValues = useRef(
    state.routes.map((_: any, i: number) => new Animated.Value(i === state.index ? 1.15 : 1))
  ).current;

  useEffect(() => {
    state.routes.forEach((_: any, index: number) => {
      Animated.spring(scaleAnimValues[index], {
        toValue: index === state.index ? 1.15 : 1,
        friction: 8,
        tension: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  const barWidth = width;

  // Clean SVG Path with rounded top corners
  const d = `
    M 0 20
    Q 0 0 20 0
    L ${barWidth - 20} 0
    Q ${barWidth} 0 ${barWidth} 20
    L ${barWidth} ${barHeight}
    L 0 ${barHeight}
    Z
  `;

  return (
    <View style={[styles.container, { height: barHeight, bottom: 0 }]}>
      {/* Background SVG */}
      <Svg width={barWidth} height={barHeight} style={StyleSheet.absoluteFill}>
        <Path
          d={d}
          fill={colors.surface}
          stroke={colors.outlineVariant + '30'}
          strokeWidth={1}
        />
      </Svg>

      {/* Flat Tabs Container */}
      <View style={[styles.tabsRow, { paddingBottom: bottomInset }]}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            hapticService.selection();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = TAB_ICONS[route.name] || 'circle';
          const label = getTabLabel(route.name);

          const translateY = scaleAnimValues[index].interpolate({
            inputRange: [1, 1.15],
            outputRange: [0, -4],
          });

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabButton}
            >
              <Animated.View
                style={[
                  styles.tabIconBadge,
                  isFocused ? [
                    styles.activeTabBadge,
                    { backgroundColor: colors.primary }
                  ] : styles.inactiveTabBadge,
                  {
                    transform: [
                      { scale: scaleAnimValues[index] },
                      { translateY },
                    ],
                  },
                ]}
              >
                <MaterialIcons
                  name={iconName}
                  size={isFocused ? 24 : 22}
                  color={isFocused ? colors.onPrimary || '#FFFFFF' : colors.onSurfaceVariant}
                />
              </Animated.View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary : colors.onSurfaceVariant },
                  isFocused && styles.activeTabLabel,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 90,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeTabBadge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  inactiveTabBadge: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});

export default AnimatedCurvedTabBar;
