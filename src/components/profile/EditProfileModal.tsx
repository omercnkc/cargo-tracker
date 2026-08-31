import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../hooks/useTranslation';
import { ModernFeedbackModal, FeedbackType } from '../common/ModernFeedbackModal';
import { formatTitleCaseTR } from '../../utils/stringFormatters';
import { validateFullName, validatePhone, formatPhoneTR } from '../../utils/validators';
import { hapticService } from '../../services/haptics.service';
import { styles } from './EditProfileModal.styles';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(500);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 240,
        useNativeDriver: true,
      }).start();
      setFullName(profile?.full_name || user?.user_metadata?.full_name || '');
      setPhone(profile?.phone ? formatPhoneTR(profile.phone) : '');
      setErrors({});
    }
  }, [visible, profile, user]);

  const handleCloseWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleCloseWithAnimation();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const handleFullNameChange = (text: string) => {
    // Sadece harf, boşluk ve tire karakterlerine izin ver (rakam ve sembolleri engelle)
    const filteredText = text.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]/g, '');
    setFullName(filteredText);
    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
  };

  const handlePhoneChange = (text: string) => {
    // Otomatik Türkiye formatlama 0 (5XX) XXX XX XX
    const formatted = formatPhoneTR(text);
    setPhone(formatted);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleSave = async () => {
    const newErrors: { fullName?: string; phone?: string } = {};

    // 1. Ad Soyad Doğrulaması
    const nameVal = validateFullName(fullName);
    if (!nameVal.isValid) {
      newErrors.fullName = nameVal.error;
    }

    // 2. Telefon Numarası Doğrulaması (Eğer doldurulduysa veya zorunluysa)
    if (phone.trim().length > 0) {
      const phoneVal = validatePhone(phone);
      if (!phoneVal.isValid) {
        newErrors.phone = phoneVal.error;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      hapticService.error();
      setErrors(newErrors);
      return;
    }

    hapticService.buttonPress();
    setErrors({});
    setLoading(true);

    const result = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim() ? phone.trim() : null,
    });

    setLoading(false);

    if (result.error) {
      hapticService.error();
      setFeedback({
        visible: true,
        type: 'error',
        title: t('error'),
        message: result.error,
      });
    } else {
      hapticService.success();
      setFeedback({
        visible: true,
        type: 'success',
        title: t('profileUpdatedTitle'),
        message: t('profileUpdatedMsg'),
        onConfirm: () => {
          setFeedback((prev) => ({ ...prev, visible: false }));
          handleCloseWithAnimation();
        },
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseWithAnimation}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleCloseWithAnimation}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surfaceContainerLowest,
              paddingBottom: insets.bottom || 24,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle Bar */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />
          </View>

          {/* Header */}
          <View style={styles.header} {...panResponder.panHandlers}>
            <View style={styles.titleRow}>
              <MaterialIcons name="person" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>{t('editProfile')}</Text>
            </View>
            <TouchableOpacity onPress={handleCloseWithAnimation} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            {/* E-Posta (Salt Okunur) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{t('emailAddressLabel')}</Text>
              <View style={[styles.disabledInputRow, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
                <MaterialIcons name="email" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                <Text style={[styles.disabledInputText, { color: colors.onSurfaceVariant }]}>
                  {user?.email || t('notAddedYet')}
                </Text>
                <MaterialIcons name="lock" size={16} color={colors.outlineVariant} />
              </View>
              <Text style={[styles.helperText, { color: colors.outline }]}>{t('emailCannotBeChanged')}</Text>
            </View>

            {/* Ad Soyad Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurface }]}>{t('fullNameLabel')} *</Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: colors.surface, borderColor: errors.fullName ? colors.error : colors.outlineVariant },
                ]}
              >
                <MaterialIcons name="person-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.onSurface }]}
                  placeholder={t('fullNamePlaceholder')}
                  placeholderTextColor={colors.outline}
                  maxLength={50}
                  value={fullName}
                  onChangeText={handleFullNameChange}
                />
              </View>
              {errors.fullName ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.fullName}</Text>
              ) : (
                <Text style={[styles.helperText, { color: colors.outline }]}>{t('fullNameHelper')}</Text>
              )}
            </View>

            {/* Telefon Numarası Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurface }]}>{t('phoneNumberLabel')}</Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: colors.surface, borderColor: errors.phone ? colors.error : colors.outlineVariant },
                ]}
              >
                <MaterialIcons name="phone" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.onSurface }]}
                  placeholder={t('phonePlaceholder') || '(5XX) XXX XX XX'}
                  placeholderTextColor={colors.outline}
                  keyboardType="phone-pad"
                  maxLength={17}
                  value={phone}
                  onChangeText={handlePhoneChange}
                />
              </View>
              {errors.phone ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone}</Text>
              ) : (
                <Text style={[styles.helperText, { color: colors.outline }]}>{t('phoneHelper')}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#ffffff" />
                  <Text style={styles.submitButtonText}>{t('saveChangesBtn')}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <ModernFeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onPrimaryAction={() => {
          if (feedback.onConfirm) {
            feedback.onConfirm();
          } else {
            setFeedback((prev) => ({ ...prev, visible: false }));
          }
        }}
        onClose={() => setFeedback((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
}

export default EditProfileModal;
