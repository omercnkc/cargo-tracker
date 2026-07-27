import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

export const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  
  // Animation values using standard React Native Animated
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderTranslateY = useRef(new Animated.Value(20)).current;
  
  const roadTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in up for logo section
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in up for loader section (delayed)
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loaderTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Road moving animation (infinite loop)
    Animated.loop(
      Animated.timing(roadTranslateX, {
        toValue: -16,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Generating road dashes
  const roadDashes = Array.from({ length: 10 }).map((_, i) => (
    <View key={i} style={styles.roadDash} />
  ));

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      
      <Animated.View style={[
        styles.content, 
        {
          opacity: logoOpacity,
          transform: [{ translateY: logoTranslateY }],
        }
      ]}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="inventory" size={128} color={colors.onPrimary} />
        </View>
        
        <Text style={styles.brandName}>KargoTakip</Text>
        <Text style={styles.tagline}>Precision Global Logistics</Text>
      </Animated.View>

      <Animated.View style={[
        styles.loaderSection, 
        {
          opacity: loaderOpacity,
          transform: [{ translateY: loaderTranslateY }],
        }
      ]}>
        <View style={styles.loaderIconContainer}>
          <MaterialIcons name="local-shipping" size={32} color={colors.onPrimary} />
          <View style={styles.roadContainer}>
            <Animated.View style={[
              styles.roadInner, 
              { transform: [{ translateX: roadTranslateX }] }
            ]}>
              {roadDashes}
            </Animated.View>
          </View>
        </View>
        
        <Text style={styles.loaderText}>INITIALIZING SECURE CONNECTION...</Text>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 128,
    height: 128,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: 'Inter',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.64,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.primaryFixedDim,
    opacity: 0.8,
  },
  loaderSection: {
    paddingTop: 32,
    marginBottom: 48,
    alignItems: 'center',
  },
  loaderIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roadContainer: {
    width: 80,
    height: 3,
    overflow: 'hidden',
    marginTop: 4,
    opacity: 0.8,
  },
  roadInner: {
    flexDirection: 'row',
    width: 160,
  },
  roadDash: {
    width: 8,
    height: 3,
    backgroundColor: colors.onPrimary,
    marginRight: 8,
  },
  loaderText: {
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.primaryFixedDim,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
