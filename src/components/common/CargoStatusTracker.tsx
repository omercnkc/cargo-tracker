import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { styles } from './CargoStatusTracker.styles';
import { getShipmentProgress, TRACKING_STEPS } from '../../utils/shipmentUtils';

interface CargoStatusTrackerProps {
  status?: string | null;
  compact?: boolean;
  showLabels?: boolean;
}

export const CargoStatusTracker: React.FC<CargoStatusTrackerProps> = ({
  status,
  compact = false,
  showLabels = true,
}) => {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const progressInfo = getShipmentProgress(status);
  const { stepIndex, progressPercent, colorHex } = progressInfo;
  const isDelivered = stepIndex === 5;

  // Animation values (all using useNativeDriver: false to avoid mixing native/non-native drivers on same tree)
  const dashAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const truckPositionAnim = useRef(new Animated.Value(progressPercent)).current;

  // 1. Moving road dashed lines animation (- - -)
  useEffect(() => {
    if (isDelivered) {
      dashAnim.setValue(0);
      return;
    }

    const loopAnim = Animated.loop(
      Animated.timing(dashAnim, {
        toValue: -24,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loopAnim.start();

    return () => loopAnim.stop();
  }, [isDelivered, dashAnim]);

  // 2. Truck suspension / vibration bounce effect
  useEffect(() => {
    if (isDelivered) {
      bounceAnim.setValue(0);
      return;
    }

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -3,
          duration: 350,
          easing: Easing.quad,
          useNativeDriver: false,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.quad,
          useNativeDriver: false,
        }),
      ])
    );
    bounceLoop.start();

    return () => bounceLoop.stop();
  }, [isDelivered, bounceAnim]);

  // 3. Smooth truck position transition
  useEffect(() => {
    Animated.timing(truckPositionAnim, {
      toValue: progressPercent,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressPercent, truckPositionAnim]);

  // Interpolate truck left position
  const truckLeftStyle = truckPositionAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Main Tracker Container */}
      <View style={styles.trackerWrapper}>
        {/* Animated Road Track (Background) */}
        <View style={[styles.roadTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
          {/* Active Colored Progress Fill Bar (Placed first, contains moving dashed road stripes inside) */}
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(progressPercent, 2)}%`,
                backgroundColor: colorHex,
              },
            ]}
          >
            {/* Animated Dashed Road Lines (- - -) Only visible within active progress fill */}
            <View style={styles.dashContainer}>
              <Animated.View
                style={[
                  styles.dashRow,
                  {
                    transform: [{ translateX: dashAnim }],
                  },
                ]}
              >
                {Array.from({ length: 32 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dashStripe,
                      { backgroundColor: '#FFFFFF', opacity: isDelivered ? 0.9 : 0.85 },
                    ]}
                  />
                ))}
              </Animated.View>
            </View>
          </View>
        </View>

        {/* 6 Step Milestone Dots */}
        <View style={styles.nodesContainer} pointerEvents="none">
          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx <= stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <View key={step.id} style={styles.nodeWrapper}>
                <View
                  style={[
                    styles.nodeDot,
                    {
                      backgroundColor: isCompleted
                        ? colorHex
                        : colors.surfaceContainerLowest,
                      borderColor: isCompleted
                        ? colorHex
                        : colors.outlineVariant,
                    },
                    isCurrent && [
                      styles.nodeDotCurrent,
                      { borderColor: colorHex, backgroundColor: colors.surfaceContainerLowest },
                    ],
                  ]}
                >
                  {isCompleted && idx < stepIndex && (
                    <MaterialIcons name="check" size={10} color="#FFFFFF" />
                  )}
                  {isCurrent && (
                    <View style={[styles.innerCurrentDot, { backgroundColor: colorHex }]} />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Floating Cargo Truck Vehicle Icon */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.truckBadge,
            {
              left: truckLeftStyle,
              transform: [{ translateY: bounceAnim }, { translateX: -14 }],
            },
          ]}
        >
          <View style={[styles.truckBadgeInner, { backgroundColor: colorHex }]}>
            <MaterialIcons name="local-shipping" size={14} color="#FFFFFF" />
          </View>
        </Animated.View>
      </View>

      {/* 6 Step Labels */}
      {showLabels && !compact && (
        <View style={styles.labelsContainer}>
          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx <= stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <View key={step.id} style={styles.labelWrapper}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.labelText,
                    {
                      color: isCurrent
                        ? colors.onSurface
                        : isCompleted
                        ? colors.onSurfaceVariant
                        : colors.outline,
                      fontWeight: isCurrent ? '700' : isCompleted ? '600' : '400',
                    },
                  ]}
                >
                  {t(step.titleKey as any) || step.defaultTitle}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default CargoStatusTracker;
