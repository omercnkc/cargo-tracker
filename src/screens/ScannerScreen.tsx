import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ImageBackground,
  Animated,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';

const BG_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW4D6V42SnIcoqTa5C_56p4e9Myk4KihNXxdwGMtq5hOnKBHg2vs8npkwWIt3q7LeLcsMTcTpDNHEkKnfZH6XsS6KIEkqctSbXLxFkcO2s8SzLPpeqSplx9oJP_ko1QS7YlMB9dmPiV_RTP0Lj0oYSYWNmlHG7DTzumEukaYgGoDBhia-Y9nmxC7G_8mA7oRBpQu1wUowgBaEpFgBYtZMjWiMHCPAotSCXSJflxRIHK9Sq-stmFp47_1A9O1dr6W29ciuntdgZwuY';

export const ScannerScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Animation for the scanning line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 240, // Height of the scanner frame (approx)
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    };
    startAnimation();
  }, [scanLineAnim]);

  return (
    <View style={styles.container}>
      
      {/* Mock Camera Background */}
      <ImageBackground 
        source={{ uri: BG_IMAGE_URL }} 
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Top App Bar */}
      <View style={[styles.appBar, { paddingTop: insets.top || 16 }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Text style={styles.appBarTitle}>Scan Package</Text>
        
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="flashlight-on" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Scanner Overlay Content */}
      <View style={styles.overlayContent}>
        
        {/* Instruction Bubble */}
        <View style={styles.instructionBubble}>
          <Text style={styles.instructionText}>Center the QR code within the frame</Text>
        </View>

        {/* Scanner Frame */}
        <View style={styles.scannerFrameContainer}>
          {/* A large border creates the semi-transparent overlay around the clear center */}
          <View style={styles.scannerOverlayDarken} />

          <View style={styles.scannerFrame}>
            {/* Corner Indicators */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scanning Line Animation */}
            <Animated.View style={[
              styles.scanLine, 
              { transform: [{ translateY: scanLineAnim }] }
            ]} />
          </View>
        </View>

        {/* Controls Below Scanner */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton}>
            <View style={styles.controlIconBox}>
              <MaterialIcons name="image" size={24} color="#ffffff" />
            </View>
            <Text style={styles.controlText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual Entry Fallback */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity 
          style={styles.manualEntryButton}
          onPress={() => navigation.navigate('AddPackage')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="keyboard" size={24} color={colors.primary} />
          <Text style={styles.manualEntryText}>Enter tracking number manually</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 100, // Includes status bar padding roughly
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingBottom: 100, // Offset for bottom button
  },
  instructionBubble: {
    marginBottom: 32,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
  },
  instructionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#ffffff',
  },
  scannerFrameContainer: {
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scannerOverlayDarken: {
    position: 'absolute',
    width: 9999,
    height: 9999,
    borderWidth: 4000,
    borderColor: 'rgba(11, 28, 48, 0.6)',
    borderRadius: 4016, // So inner is rounded
  },
  scannerFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: 4, borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: 4, borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 4, borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 5,
  },
  controlsContainer: {
    marginTop: 48,
    flexDirection: 'row',
    gap: 32,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  manualEntryText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
});

export default ScannerScreen;
