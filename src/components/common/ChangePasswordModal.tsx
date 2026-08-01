import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase/supabase';
import { useTheme } from '../../theme/useTheme';
import { ModernFeedbackModal, FeedbackType } from './ModernFeedbackModal';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { theme: colors } = useTheme();

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
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errors.newPassword = 'Yeni şifre girilmesi zorunludur.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Şifre en az 6 karakterden oluşmalıdır.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı girilmesi zorunludur.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Şifreler birbiriyle uyuşmuyor.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFeedback({
        visible: true,
        type: 'warning',
        title: 'Zorunlu Alanlar Eksik',
        message: 'Lütfen kırmızı ile belirtilen tüm alanları doldurun.',
      });
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setLoading(false);

      if (error) {
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Hata',
          message: error.message || 'Şifre güncellenemedi.',
        });
      } else {
        setFeedback({
          visible: true,
          type: 'success',
          title: 'Şifre Güncellendi 🔒',
          message: 'Hesap şifreniz başarıyla değiştirilmiştir.',
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
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Hata',
        message: err.message || 'Şifre güncellenirken bir sorun oluştu.',
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
              <Text style={[styles.title, { color: colors.primary }]}>Şifre Değiştir</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            Hesabınızın güvenliği için yeni güçlü bir şifre belirleyin.
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>
              Yeni Şifre <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input, 
                { borderColor: fieldErrors.newPassword ? colors.error : colors.outlineVariant, color: colors.onBackground },
                fieldErrors.newPassword ? { borderWidth: 1.5 } : null
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.onSurfaceVariant}
              secureTextEntry
              value={newPassword}
              onChangeText={(val) => {
                setNewPassword(val);
                if (fieldErrors.newPassword) setFieldErrors(prev => ({ ...prev, newPassword: undefined }));
              }}
            />
            {!!fieldErrors.newPassword && (
              <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.newPassword}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>
              Yeni Şifre (Tekrar) <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input, 
                { borderColor: fieldErrors.confirmPassword ? colors.error : colors.outlineVariant, color: colors.onBackground },
                fieldErrors.confirmPassword ? { borderWidth: 1.5 } : null
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.onSurfaceVariant}
              secureTextEntry
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
            />
            {!!fieldErrors.confirmPassword && (
              <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.confirmPassword}</Text>
            )}
          </View>

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
                <Text style={styles.submitButtonText}>Şifreyi Güncelle</Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
