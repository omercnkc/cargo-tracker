import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ImageBackground,
  Animated,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { OCRService } from '../services/ocr/ocrService';

const BG_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW4D6V42SnIcoqTa5C_56p4e9Myk4KihNXxdwGMtq5hOnKBHg2vs8npkwWIt3q7LeLcsMTcTpDNHEkKnfZH6XsS6KIEkqctSbXLxFkcO2s8SzLPpeqSplx9oJP_ko1QS7YlMB9dmPiV_RTP0Lj0oYSYWNmlHG7DTzumEukaYgGoDBhia-Y9nmxC7G_8mA7oRBpQu1wUowgBaEpFgBYtZMjWiMHCPAotSCXSJflxRIHK9Sq-stmFp47_1A9O1dr6W29ciuntdgZwuY';

export const ScannerScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [scanMode, setScanMode] = useState<'QR' | 'OCR'>('QR');
  const [flashlight, setFlashlight] = useState(false);

  // Animation for the scanning line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 240,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    };
    startAnimation();
  }, [scanLineAnim]);

  const handleSimulateScan = () => {
    if (scanMode === 'OCR') {
      // Simüle edilen kargo etiketi metni
      const sampleReceiptText = `
        GÖNDERİCİ: HIZLI KARGO A.Ş.
        İRSALİYE NO: 9948201
        TAKİP NO: TR-948201948
        TARİH: 30.07.2026
      `;
      const ocrResult = OCRService.extractTrackingNumber(sampleReceiptText);

      Alert.alert(
        '📄 OCR Metin Algılandı',
        `Tespit Edilen Takip No: ${ocrResult.detectedNumber}\nGüven Oranı: %${Math.round(ocrResult.confidence * 100)}`,
        [
          {
            text: 'Forma Aktar',
            onPress: () => {
              navigation.navigate('AddPackage', { scannedTrackingNumber: ocrResult.detectedNumber });
            },
          },
        ]
      );
    } else {
      const scannedCode = `TR-${Math.floor(100000000 + Math.random() * 900000000)}`;
      Alert.alert('QR / Barkod Tarandı', `Takip No: ${scannedCode}`, [
        {
          text: 'Forma Aktar',
          onPress: () => {
            navigation.navigate('AddPackage', { scannedTrackingNumber: scannedCode });
          },
        },
      ]);
    }
  };

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
        
        {/* QR vs OCR Mode Selector Switch */}
        <View style={styles.modeSwitchContainer}>
          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'QR' && styles.modeTabActive]}
            onPress={() => setScanMode('QR')}
          >
            <Text style={[styles.modeTabText, scanMode === 'QR' && styles.modeTabTextActive]}>QR / Barkod</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'OCR' && styles.modeTabActive]}
            onPress={() => setScanMode('OCR')}
          >
            <Text style={[styles.modeTabText, scanMode === 'OCR' && styles.modeTabTextActive]}>OCR Metin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setFlashlight(!flashlight)}
        >
          <MaterialIcons name={flashlight ? "flashlight-on" : "flashlight-off"} size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Scanner Overlay Content */}
      <View style={styles.overlayContent}>
        <View style={styles.instructionBubble}>
          <Text style={styles.instructionText}>
            {scanMode === 'OCR'
              ? '📷 Kargo etiketini veya fişini hizada tutun'
              : '📷 QR kodu çerçevenin ortasına hizalayın'}
          </Text>
        </View>

        {/* Scanner Frame */}
        <TouchableOpacity style={styles.scannerFrameContainer} activeOpacity={0.9} onPress={handleSimulateScan}>
          <View style={styles.scannerOverlayDarken} />

          <View style={styles.scannerFrame}>
            {/* Corner Indicators */}
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />

            {/* Scanning Line Animation */}
            <Animated.View style={[
              styles.scanLine, 
              { backgroundColor: scanMode === 'OCR' ? '#10b981' : colors.primary, transform: [{ translateY: scanLineAnim }] }
            ]} />
          </View>
        </TouchableOpacity>

        {/* Controls Below Scanner */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={handleSimulateScan}>
            <View style={styles.controlIconBox}>
              <MaterialIcons name={scanMode === 'OCR' ? "document-scanner" : "qr-code-scanner"} size={24} color="#ffffff" />
            </View>
            <Text style={styles.controlText}>
              {scanMode === 'OCR' ? 'Metni Tara (OCR)' : 'QR Tara (Simüle)'}
            </Text>
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
          <MaterialIcons name="keyboard" size={24} color="#ffffff" />
          <Text style={styles.manualEntryText}>Manuel Takip No Girin</Text>
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
    height: 100,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeTabActive: {
    backgroundColor: '#ffffff',
  },
  modeTabText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#0b1c30',
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
    paddingBottom: 100,
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
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 4016,
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
