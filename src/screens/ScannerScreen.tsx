import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { OCRService } from '../services/ocr/ocrService';

export const ScannerScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanMode, setScanMode] = useState<'QR' | 'OCR'>('QR');
  const [flashlight, setFlashlight] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Animation for the laser scanning line
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

  // Kamera izin durumunu kontrol et
  if (!permission) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContent, { padding: 24 }]}>
        <MaterialIcons name="camera-alt" size={64} color="#3b82f6" style={{ marginBottom: 16 }} />
        <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
        <Text style={styles.permissionText}>
          Kargo QR ve barkodlarını doğrudan kameranız ile tarayabilmek için kamera izni vermeniz gerekmektedir.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.permissionBtnText}>Kamera İznini Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#94a3b8', fontSize: 14 }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Gerçek QR / Barkod okunduğunda tetiklenen fonksiyon
  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    const trackingNumber = OCRService.extractTrackingNumber(data).detectedNumber || data;

    Alert.alert(
      '🎉 Barkod Algılandı!',
      `Kargo Takip No: ${trackingNumber}`,
      [
        {
          text: 'Tekrar Tara',
          onPress: () => setScanned(false),
          style: 'cancel',
        },
        {
          text: 'Forma Aktar',
          onPress: () => {
            navigation.navigate('AddPackage', { scannedTrackingNumber: trackingNumber });
          },
        },
      ]
    );
  };

  // OCR Simülasyon / Manuel Tarama Butonu
  const handleSimulateOCRScan = () => {
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
  };

  return (
    <View style={styles.container}>
      {/* Real Expo Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        enableTorch={flashlight}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'pdf417', 'aztec', 'datamatrix'],
        }}
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
            onPress={() => {
              setScanMode('QR');
              setScanned(false);
            }}
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
              ? '📷 Kargo etiketini hizada tutun ve tarayın'
              : '📷 QR veya Barkodu çerçevenin ortasına hizalayın'}
          </Text>
        </View>

        {/* Scanner Frame */}
        <View style={styles.scannerFrameContainer}>
          <View style={styles.scannerOverlayDarken} />

          <View style={styles.scannerFrame}>
            {/* Corner Indicators */}
            <View style={[styles.corner, styles.cornerTL, { borderColor: scanMode === 'OCR' ? '#10b981' : colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: scanMode === 'OCR' ? '#10b981' : colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: scanMode === 'OCR' ? '#10b981' : colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: scanMode === 'OCR' ? '#10b981' : colors.primary }]} />

            {/* Scanning Line Animation */}
            <Animated.View style={[
              styles.scanLine, 
              { backgroundColor: scanMode === 'OCR' ? '#10b981' : colors.primary, transform: [{ translateY: scanLineAnim }] }
            ]} />
          </View>
        </View>

        {/* Controls Below Scanner */}
        {scanMode === 'OCR' && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handleSimulateOCRScan}>
              <View style={styles.controlIconBox}>
                <MaterialIcons name="document-scanner" size={24} color="#ffffff" />
              </View>
              <Text style={styles.controlText}>Etiket Metnini Tara (OCR)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Manual Entry Fallback */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity 
          style={styles.manualEntryButton}
          onPress={() => navigation.navigate('AddPackage')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="keyboard" size={22} color="#ffffff" />
          <Text style={styles.manualEntryText}>Manuel Takip No Girin</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingBottom: 60,
  },
  instructionBubble: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 999,
  },
  instructionText: {
    fontFamily: 'Inter',
    fontSize: 13,
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
    borderColor: 'rgba(0, 0, 0, 0.6)',
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
    marginTop: 32,
    flexDirection: 'row',
    gap: 32,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  manualEntryText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
});

export default ScannerScreen;
