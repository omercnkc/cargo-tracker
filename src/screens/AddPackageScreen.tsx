import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { useCourierCompanies, useAddShipment } from '../features/shipment/hooks/useShipments';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useUserAddresses } from '../hooks/useUserAddresses';
import { EmailConnectModal } from '../components/import/EmailConnectModal';
import { CarrierSelectionSheet } from '../components/package/CarrierSelectionSheet';
import { OCRService } from '../services/ocr/ocrService';
import { ModernFeedbackModal, FeedbackType } from '../components/common/ModernFeedbackModal';
import { DEFAULT_CARRIERS } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { formatTrackingNumber, formatTitleCaseTR } from '../utils/stringFormatters';
import { hapticService } from '../services/haptics.service';
import { styles } from './AddPackageScreen.styles';

export const AddPackageScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const user = useAuthStore(state => state.user);
  const { theme: colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const { data: dbCouriers } = useCourierCompanies();
  const addShipmentMutation = useAddShipment();
  const { defaultAddress } = useUserAddresses();

  // Always use local DEFAULT_CARRIERS for UI (guaranteed icons)
  const carriers = DEFAULT_CARRIERS;

  // Map local carrier id -> DB company UUID for submission
  const getDbCompanyId = useMemo(() => {
    if (!dbCouriers || dbCouriers.length === 0) return (_localId: string) => null;
    return (localId: string) => {
      const localCarrier = DEFAULT_CARRIERS.find(c => c.id === localId);
      if (!localCarrier) return null;
      const dbMatch = dbCouriers.find(
        (db) => db.name.toLowerCase().includes(localCarrier.code) ||
                localCarrier.name.toLowerCase().includes(db.name.toLowerCase()) ||
                db.name.toLowerCase().includes(localCarrier.name.toLowerCase())
      );
      return dbMatch?.id || null;
    };
  }, [dbCouriers]);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [clipboardDetected, setClipboardDetected] = useState<string | null>(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ trackingNumber?: string; selectedCarrier?: string }>({});

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    trackingNumber?: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (route.params?.scannedTrackingNumber) {
      setTrackingNumber(route.params.scannedTrackingNumber);
    }
  }, [route.params?.scannedTrackingNumber]);

  // Panodaki takip numarasını otomatik algıla
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await Clipboard.getStringAsync();
        if (text) {
          const res = OCRService.extractTrackingNumber(text);
          if (res.detectedNumber && res.detectedNumber !== trackingNumber) {
            setClipboardDetected(res.detectedNumber);
          }
        }
      } catch {
        // Clipboard read fallback
      }
    };
    checkClipboard();
  }, []);

  const filteredCarriers = useMemo(() => {
    return carriers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [carriers, searchQuery]);

  const activeCarrier = useMemo(() => {
    return carriers.find(c => c.id === selectedCarrier);
  }, [carriers, selectedCarrier]);

  const handleApplyClipboard = () => {
    if (clipboardDetected) {
      hapticService.selection();
      setTrackingNumber(clipboardDetected);
      setClipboardDetected(null);
    }
  };

  const handleSubmit = async () => {
    hapticService.buttonPress();
    const errors: { trackingNumber?: string; selectedCarrier?: string } = {};
    if (!trackingNumber.trim()) {
      errors.trackingNumber = t('trackingNumberRequired');
    }
    if (!selectedCarrier) {
      errors.selectedCarrier = t('carrierRequired');
    }

    if (Object.keys(errors).length > 0) {
      hapticService.warning();
      setFieldErrors(errors);
      setFeedback({
        visible: true,
        type: 'warning',
        title: t('missingFieldsTitle'),
        message: t('missingFieldsMsg'),
      });
      return;
    }
    setFieldErrors({});

    if (!user) {
      hapticService.error();
      setFeedback({
        visible: true,
        type: 'error',
        title: t('authRequiredTitle'),
        message: t('authRequiredMsg'),
      });
      return;
    }

    try {
      const formattedTrackingNo = formatTrackingNumber(trackingNumber);
      const formattedTitle = nickname.trim() ? formatTitleCaseTR(nickname) : null;
      const carrierName = activeCarrier?.name || 'Kargo';
      const dbCompanyId = selectedCarrier ? getDbCompanyId(selectedCarrier) : null;

      const receiverText = defaultAddress
        ? `${defaultAddress.fullName}\n${defaultAddress.fullAddress}`
        : 'Ahmet Yılmaz\nCihannüma Mah. Barbaros Bulvarı No:42 D:5, Beşiktaş / İstanbul';
      const lastLocText = defaultAddress
        ? `${defaultAddress.district} Dağıtım Bölgesi, ${defaultAddress.city}`
        : 'Beşiktaş Dağıtım Bölgesi, İstanbul';

      await addShipmentMutation.mutateAsync({
        user_id: user.id,
        tracking_number: formattedTrackingNo,
        company_id: dbCompanyId,
        title: formattedTitle,
        sender: carrierName,
        receiver: receiverText,
        last_location: lastLocText,
        current_status: 'transit',
      });

      hapticService.success();
      setFeedback({
        visible: true,
        type: 'success',
        title: t('addSuccessTitle'),
        message: t('addSuccessMsg'),
        trackingNumber: formattedTrackingNo,
        onConfirm: () => {
          setFeedback(prev => ({ ...prev, visible: false }));
          navigation.navigate('Packages');
        },
      });
    } catch (err: any) {
      hapticService.error();
      setFeedback({
        visible: true,
        type: 'error',
        title: t('addErrorTitle'),
        message: err.message || t('error'),
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* TopAppBar */}
        <View style={[{
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.outlineVariant + '40',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          zIndex: 30,
          paddingTop: insets.top,
        }]}>
          <View style={styles.appBarContent}>
            <Text style={[styles.appBarTitle, { flex: 1, color: colors.primary }]}>{t('appName')}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.mainContent,
            { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[isLargeScreen ? styles.pageTitleLarge : styles.pageTitle, { color: colors.primary }]}>
              {t('addPackageTitle')}
            </Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
              {t('addPackageSubtitle')}
            </Text>
          </View>

          {/* Panodan Algılanan Kargo Bildirim Rozeti */}
          {clipboardDetected && (
            <TouchableOpacity
              style={[
                styles.clipboardBadge,
                {
                  backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff',
                  borderColor: isDarkMode ? '#3b82f6' : '#bfdbfe',
                },
              ]}
              onPress={handleApplyClipboard}
              activeOpacity={0.8}
            >
              <MaterialIcons name="content-paste-go" size={22} color={isDarkMode ? '#93c5fd' : '#2563eb'} />
              <Text style={[styles.clipboardText, { color: isDarkMode ? '#93c5fd' : '#1e40af' }]}>
                {t('clipboardDetectedPrefix')}<Text style={styles.clipboardCode}>{clipboardDetected}</Text>{t('clipboardDetectedSuffix')}
              </Text>
            </TouchableOpacity>
          )}

          {/* E-Posta Bağlama Hızlı Butonu */}
          <TouchableOpacity
            style={[
              styles.emailSyncCard,
              {
                backgroundColor: isDarkMode ? '#0c4a6e' : '#f0f9ff',
                borderColor: isDarkMode ? '#0284c7' : '#bae6fd',
              },
            ]}
            onPress={() => setEmailModalVisible(true)}
            activeOpacity={0.85}
          >
            <MaterialIcons name="mark-email-unread" size={24} color={isDarkMode ? '#38bdf8' : '#00236f'} />
            <View style={styles.emailSyncTextWrapper}>
              <Text style={[styles.emailSyncTitle, { color: isDarkMode ? '#7dd3fc' : '#0369a1' }]}>{t('autoImportEmail')}</Text>
              <Text style={[styles.emailSyncSubtitle, { color: isDarkMode ? '#38bdf8' : '#0284c7' }]}>{t('autoImportSubtitle')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={isDarkMode ? '#38bdf8' : '#00236f'} />
          </TouchableOpacity>

          {/* Main Form Block */}
          <View style={[styles.formBlock, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>

            {/* Tracking Number Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.onSurface }]}>
                {t('trackingNumberLabel')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: fieldErrors.trackingNumber ? (colors.error || '#BA1A1A') : colors.outlineVariant }, fieldErrors.trackingNumber ? { borderWidth: 1.5 } : null]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="tag" size={22} color={fieldErrors.trackingNumber ? (colors.error || '#BA1A1A') : colors.outline} />
                </View>
                <TextInput
                  style={[styles.inputMono, { color: colors.onSurface }]}
                  placeholder={t('trackingPlaceholder')}
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={trackingNumber}
                  onChangeText={(val) => {
                    setTrackingNumber(val);
                    if (fieldErrors.trackingNumber) setFieldErrors(prev => ({ ...prev, trackingNumber: undefined }));
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => navigation.navigate('Scanner')}
                >
                  <MaterialIcons name="qr-code-scanner" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {!!fieldErrors.trackingNumber && (
                <Text style={{ fontSize: 12, color: colors.error || '#BA1A1A', marginTop: 4, fontWeight: '500' }}>{fieldErrors.trackingNumber}</Text>
              )}
            </View>

            {/* Carrier Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.onSurface }]}>
                {t('carrierLabel')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.carrierSelectorBtn, { backgroundColor: colors.surface, borderColor: fieldErrors.selectedCarrier ? (colors.error || '#BA1A1A') : colors.outlineVariant }, fieldErrors.selectedCarrier ? { borderWidth: 1.5 } : null]}
                onPress={() => {
                  setSheetVisible(true);
                  if (fieldErrors.selectedCarrier) setFieldErrors(prev => ({ ...prev, selectedCarrier: undefined }));
                }}
                activeOpacity={0.8}
              >
                {activeCarrier ? (
                  <View style={styles.carrierSelectorContent}>
                    <CarrierLogo logo={activeCarrier.logo} size={24} />
                    <Text style={[styles.carrierSelectorText, { color: colors.onSurface }]}>{activeCarrier.name}</Text>
                  </View>
                ) : (
                  <Text style={[styles.carrierSelectorPlaceholder, { color: colors.onSurfaceVariant }]}>{t('selectCarrier')}</Text>
                )}
                <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
              </TouchableOpacity>
              {!!fieldErrors.selectedCarrier && (
                <Text style={{ fontSize: 12, color: colors.error || '#BA1A1A', marginTop: 4, fontWeight: '500' }}>{fieldErrors.selectedCarrier}</Text>
              )}
            </View>

            {/* Package Nickname */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.onSurface }]}>{t('packageNicknameLabel')}</Text>
                <Text style={[styles.optionalText, { color: colors.outline }]}>{t('optional')}</Text>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="inventory" size={22} color={colors.outline} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.onSurface }]}
                  placeholder={t('nicknamePlaceholder')}
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={nickname}
                  onChangeText={setNickname}
                />
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
                onPress={handleSubmit}
                disabled={addShipmentMutation.isPending}
              >
                {addShipmentMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <>
                    <MaterialIcons name="add-box" size={22} color={colors.onPrimary} />
                    <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>{t('savePackage')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email Connect Modal */}
      <EmailConnectModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        onShipmentsImported={(items) => {
          if (items.length > 0) {
            navigation.goBack();
          }
        }}
      />

      {/* Reusable Bottom Sheet Modal for Carrier Selection */}
      <CarrierSelectionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        carriers={filteredCarriers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCarrier={(carrierId) => {
          setSelectedCarrier(carrierId);
          setSheetVisible(false);
          setSearchQuery('');
        }}
        isLargeScreen={isLargeScreen}
        bottomInset={insets.bottom}
      />

      <ModernFeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        trackingNumber={feedback.trackingNumber}
        onPrimaryAction={() => {
          if (feedback.onConfirm) {
            feedback.onConfirm();
          } else {
            setFeedback(prev => ({ ...prev, visible: false }));
          }
        }}
        onClose={() => setFeedback(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

export default AddPackageScreen;
