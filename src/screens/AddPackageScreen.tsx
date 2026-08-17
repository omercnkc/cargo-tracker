import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Image,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { useCourierCompanies, useAddShipment } from '../features/shipment/hooks/useShipments';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/useTheme';
import { EmailConnectModal } from '../components/import/EmailConnectModal';
import { OCRService } from '../services/ocr/ocrService';
import { useTranslation } from '../hooks/useTranslation';

import { ModernFeedbackModal, FeedbackType } from '../components/common/ModernFeedbackModal';
import { DEFAULT_CARRIERS, getCarrierByName, isCarrierAllowed } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { formatTrackingNumber, formatTitleCaseTR } from '../utils/stringFormatters';

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

  const [sheetVisible, setSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ trackingNumber?: string; selectedCarrier?: string }>({});

  const filteredCarriers = carriers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeCarrier = carriers.find(c => c.id === selectedCarrier);

  const handleApplyClipboard = () => {
    if (clipboardDetected) {
      setTrackingNumber(clipboardDetected);
      setClipboardDetected(null);
    }
  };

  const handleSubmit = async () => {
    const errors: { trackingNumber?: string; selectedCarrier?: string } = {};
    if (!trackingNumber.trim()) {
      errors.trackingNumber = t('trackingNumberRequired');
    }
    if (!selectedCarrier) {
      errors.selectedCarrier = t('carrierRequired');
    }

    if (Object.keys(errors).length > 0) {
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
      const formattedTitle = nickname.trim() ? formatTitleCaseTR(nickname) : (activeCarrier?.name || null);
      const dbCompanyId = selectedCarrier ? getDbCompanyId(selectedCarrier) : null;

      await addShipmentMutation.mutateAsync({
        user_id: user.id,
        tracking_number: formattedTrackingNo,
        company_id: dbCompanyId,
        title: formattedTitle,
        current_status: 'transit',
      });

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
      setFeedback({
        visible: true,
        type: 'error',
        title: t('addErrorTitle'),
        message: err.message || t('error'),
      });
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
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

      {/* Bottom Sheet Modal for Carrier Selection */}
      <Modal
        visible={sheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSheetVisible(false)}
          />

          <View style={[
            styles.bottomSheetContainer,
            { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
            { paddingBottom: insets.bottom || 24 },
            isLargeScreen && styles.bottomSheetContainerLarge
          ]}>

            {/* Drag Handle (Mobile) */}
            {!isLargeScreen && (
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />
              </View>
            )}

            <View style={[styles.sheetHeader, { borderBottomColor: colors.surfaceContainer }]}>
              <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>{t('selectCarrier')}</Text>
              <TouchableOpacity style={styles.iconButton} onPress={() => setSheetVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchIconContainer}>
                <MaterialIcons name="search" size={20} color={colors.outline} />
              </View>
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outlineVariant }]}
                placeholder={t('searchCarriers')}
                placeholderTextColor={colors.onSurfaceVariant}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.sheetScroll}>
              {filteredCarriers.length > 0 ? (
                <FlatList
                  data={filteredCarriers}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 24, gap: 16 }}
                  columnWrapperStyle={{ gap: 16, justifyContent: 'space-between' }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.carrierGridCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
                      onPress={() => {
                        setSelectedCarrier(item.id);
                        setSheetVisible(false);
                        setSearchQuery('');
                      }}
                    >
                      <View style={[styles.carrierGridIconBox, { backgroundColor: colors.surfaceContainer }]}>
                        <CarrierLogo logo={item.logo} size={36} />
                      </View>
                      <Text style={[styles.carrierGridName, { color: colors.onSurface }]}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <MaterialIcons name="search-off" size={32} color={colors.outlineVariant} />
                  <Text style={[styles.noResultsText, { color: colors.onSurface }]}>{t('noCarriersFound')}</Text>
                  <Text style={[styles.noResultsSubtext, { color: colors.onSurfaceVariant }]}>{t('tryDifferentSearch')}</Text>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  appBarContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    marginBottom: 16,
    gap: 4,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  pageTitleLarge: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
  },
  formBlock: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 18,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 16,
    gap: 6,
    zIndex: 10,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.24,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 15,
  },
  clipboardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    zIndex: 10,
  },
  clipboardText: {
    fontSize: 14,
    flex: 1,
  },
  clipboardCode: {
    fontWeight: '700',
    fontFamily: 'Courier Prime',
  },
  emailSyncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    zIndex: 10,
  },
  emailSyncTextWrapper: {
    flex: 1,
  },
  emailSyncTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emailSyncSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  form: {
    gap: 18,
    zIndex: 10,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  requiredAsterisk: {},
  optionalText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingLeft: 44,
    paddingRight: 16,
  },
  inputMono: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingLeft: 44,
    paddingRight: 48,
  },
  qrButton: {
    position: 'absolute',
    right: 8,
    zIndex: 10,
    padding: 8,
    borderRadius: 999,
  },
  submitContainer: {
    paddingTop: 10,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    height: 52,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  submitButtonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  carrierSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  carrierSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carrierSelectorLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  carrierSelectorText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  carrierSelectorPlaceholder: {
    fontFamily: 'Inter',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomSheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    maxHeight: '90%',
    height: 600,
  },
  bottomSheetContainerLarge: {
    maxWidth: 448,
    height: 600,
    borderRadius: 24,
    marginBottom: 16,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: 'relative',
  },
  searchIconContainer: {
    position: 'absolute',
    left: 36,
    top: 30,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 12,
    fontFamily: 'Inter',
    fontSize: 16,
  },
  sheetScroll: {
    flex: 1,
  },
  carrierGridCard: {
    width: '47%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  carrierGridIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  carrierGridLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  carrierGridName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontFamily: 'Inter',
    fontSize: 16,
    marginTop: 12,
  },
  noResultsSubtext: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 4,
  }
});

export default AddPackageScreen;
