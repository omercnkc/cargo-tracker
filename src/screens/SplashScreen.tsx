import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, TouchableWithoutFeedback, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderTranslateY = useRef(new Animated.Value(15)).current;
  
  const roadTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Native OS splash'i gizle ve özel animasyonlu JS splash'e geç
    ExpoSplashScreen.hideAsync().catch(() => {});

    // 1. Logo ve başlık fade-in & scale animasyonu
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Kamyon ve yükleniyor bölümü fade-in (gecikmeli)
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loaderTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Sonsuz hareketli yol çizgisi döngüsü
    const roadLoop = Animated.loop(
      Animated.timing(roadTranslateX, {
        toValue: -16,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    roadLoop.start();

    // 4. ~1.1 saniye sonra yumuşak geçişle (fade-out) ana ekrana devret
    const timer = setTimeout(() => {
      handleExit();
    }, 1100);

    return () => {
      clearTimeout(timer);
      roadLoop.stop();
    };
  }, []);

  const handleExit = () => {
    if (!onFinish) return;
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  // Generating road dashes
  const roadDashes = Array.from({ length: 10 }).map((_, i) => (
    <View key={i} style={styles.roadDash} />
  ));

  return (
    <TouchableWithoutFeedback onPress={handleExit}>
      <Animated.View style={[
        styles.container, 
        { 
          opacity: screenOpacity,
          paddingBottom: insets.bottom + 16,
          paddingTop: insets.top + 16,
        }
      ]}>
        
        {/* Ortadaki Gerçek Logo & Marka Alanı */}
        <Animated.View style={[
          styles.content, 
          {
            opacity: logoOpacity,
            transform: [
              { translateY: logoTranslateY },
              { scale: logoScale },
            ],
          }
        ]}>
          <View style={styles.iconContainer}>
            <View style={styles.iconGlow} />
            <Image
              source={require('../assets/kargo-takip-icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.brandName}>KargoTakip</Text>
          <Text style={styles.tagline}>Tüm Gönderileriniz Tek Uygulamada</Text>
        </Animated.View>

        {/* Alt Kamyon & Yol Animasyonu */}
        <Animated.View style={[
          styles.loaderSection, 
          {
            opacity: loaderOpacity,
            transform: [{ translateY: loaderTranslateY }],
          }
        ]}>
          <View style={styles.loaderIconContainer}>
            <MaterialIcons name="local-shipping" size={28} color="#90a8ff" />
            <View style={styles.roadContainer}>
              <Animated.View style={[
                styles.roadInner, 
                { transform: [{ translateX: roadTranslateX }] }
              ]}>
                {roadDashes}
              </Animated.View>
            </View>
          </View>
          
          <Text style={styles.loaderText}>GÜVENLİ BAĞLANTI KURULUYOR...</Text>
        </Animated.View>

      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00236f',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 112,
    height: 112,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  logoImage: {
    width: 104,
    height: 104,
    borderRadius: 24,
  },
  iconGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(144, 168, 255, 0.2)',
  },
  brandName: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#ffffff',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#b6c4ff',
    opacity: 0.9,
  },
  loaderSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  loaderIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  roadContainer: {
    width: 90,
    height: 3,
    overflow: 'hidden',
    marginTop: 6,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  roadInner: {
    flexDirection: 'row',
    width: 180,
  },
  roadDash: {
    width: 8,
    height: 3,
    backgroundColor: '#90a8ff',
    marginRight: 8,
    borderRadius: 1.5,
  },
  loaderText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#90a8ff',
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
