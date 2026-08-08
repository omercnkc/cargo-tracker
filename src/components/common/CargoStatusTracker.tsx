import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  containerCompact: {
    marginVertical: 4,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactStatusText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
  },
  compactPercentText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    fontWeight: '700',
  },
  trackerWrapper: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  roadTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  dashContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  dashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '180%',
    gap: 6,
  },
  dashStripe: {
    width: 10,
    height: 2.5,
    borderRadius: 1.25,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 5,
    overflow: 'hidden',
  },
  nodesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  nodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
  },
  nodeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDotCurrent: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
  },
  innerCurrentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  truckBadge: {
    position: 'absolute',
    top: -2,
    zIndex: 20,
  },
  truckBadgeInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 0,
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  labelText: {
    fontFamily: 'Inter',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default CargoStatusTracker;
