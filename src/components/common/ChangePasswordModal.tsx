import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase/supabase';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { ModernFeedbackModal, FeedbackType } from './ModernFeedbackModal';
import { styles } from './ChangePasswordModal.styles';
import { PasswordInput, PasswordStrengthMeter } from '../ui';
import { validatePassword } from '../../utils/validators';
import { hapticService } from '../../services/haptics.service';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

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

  const handleChangePassword = async () => {
    hapticService.buttonPress();
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    const passValidation = validatePassword(newPassword);
    if (!newPassword) {
      errors.newPassword = t('newPasswordRequired');
    } else if (!passValidation.isValid) {
      errors.newPassword = passValidation.errors[0];
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('confirmPasswordRequired');
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t('passwordsDontMatch');
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

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setLoading(false);

      if (error) {
        hapticService.error();
        setFeedback({
          visible: true,
          type: 'error',
          title: t('error'),
          message: error.message || t('passwordUpdateError'),
        });
      } else {
        hapticService.success();
        setFeedback({
          visible: true,
          type: 'success',
          title: t('passwordUpdatedTitle'),
          message: t('passwordUpdatedMsg'),
          onConfirm: () => {
            setFeedback(prev => ({ ...prev, visible: false }));
            setNewPassword('');
            setConfirmPassword('');
            onClose();
          },
        });
      }
    } catch (err: any) {
      setLoading(false);
      hapticService.error();
      setFeedback({
        visible: true,
        type: 'error',
        title: t('error'),
        message: err.message || t('passwordUpdateError'),
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialIcons name="lock-reset" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>{t('changePassword')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {t('changePasswordModalDesc')}
          </Text>

          {/* New Password */}
          <PasswordInput
            label={t('newPasswordLabel')}
            required
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              if (fieldErrors.newPassword) setFieldErrors(prev => ({ ...prev, newPassword: undefined }));
            }}
            error={fieldErrors.newPassword}
          />

          {/* Password Strength Meter */}
          <PasswordStrengthMeter password={newPassword} />

          {/* Confirm Password */}
          <PasswordInput
            label={t('confirmNewPasswordLabel')}
            required
            leftIconName="lock-reset"
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>{t('updatePasswordBtn')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ModernFeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onPrimaryAction={() => {
          if (feedback.onConfirm) {
            feedback.onConfirm();
          } else {
            setFeedback(prev => ({ ...prev, visible: false }));
          }
        }}
        onClose={() => setFeedback(prev => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
}

export default ChangePasswordModal;
