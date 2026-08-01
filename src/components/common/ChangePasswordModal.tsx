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
    if (!newPassword || newPassword.length < 6) {
      setFeedback({
        visible: true,
        type: 'warning',
        title: 'Geçersiz Şifre',
        message: 'Yeni şifreniz en az 6 karakterden oluşmalıdır.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        visible: true,
        type: 'warning',
        title: 'Şifre Uyuşmazlığı',
        message: 'Girdiğiniz yeni şifreler birbirleriyle uyuşmuyor.',
      });
      return;
    }

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
            <Text style={[styles.label, { color: colors.onSurface }]}>Yeni Şifre</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onBackground }]}
              placeholder="••••••••"
              placeholderTextColor={colors.onSurfaceVariant}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Yeni Şifre (Tekrar)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onBackground }]}
              placeholder="••••••••"
              placeholderTextColor={colors.onSurfaceVariant}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
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
