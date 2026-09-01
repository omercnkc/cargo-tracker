import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { EmailSyncService, EmailScanResult } from '../../services/import/emailSyncService';
import { GoogleAuthService, GoogleUserProfile } from '../../services/import/googleAuthService';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { ModernFeedbackModal, FeedbackType } from '../common/ModernFeedbackModal';
import { useTranslation } from '../../hooks/useTranslation';

interface EmailConnectModalProps {
  visible: boolean;
  onClose: () => void;
  onShipmentsImported?: (shipments: EmailScanResult[]) => void;
}

export function EmailConnectModal({ visible, onClose, onShipmentsImported }: EmailConnectModalProps) {
  const { theme: colors, isDarkMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [emailInput, setEmailInput] = useState('');
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<GoogleUserProfile | null>(null);
  const [isEditingCustomEmail, setIsEditingCustomEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  useEffect(() => {
    if (visible) {
      loadConnectedProfile();
    }
  }, [visible]);

  const loadConnectedProfile = async () => {
    const profile = await GoogleAuthService.getUserProfile();
    if (profile) {
      setGoogleProfile(profile);
      setConnectedEmail(profile.email);
    } else {
      const mail = await EmailSyncService.getConnectedEmail();
      const finalMail = mail || user?.email || null;
      setConnectedEmail(finalMail);
      if (finalMail) setEmailInput(finalMail);
    }
  };

  const handleSaveCustomEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setFeedback({
        visible: true,
        type: 'warning',
        title: t('invalidEmailTitle') || 'Geçersiz E-posta',
        message: t('invalidEmailMsg') || 'Lütfen geçerli bir e-posta adresi girin.',
      });
      return;
    }

    setLoading(true);
    await EmailSyncService.connectEmail(emailInput);
    setConnectedEmail(emailInput);
    setIsEditingCustomEmail(false);
    setLoading(false);

    setFeedback({
      visible: true,
      type: 'success',
      title: t('emailSavedTitle') || 'E-posta Kaydedildi',
      message: (t('emailSavedMsg') || '{{email}} adresi başarıyla bağlandı.').replace('{{email}}', emailInput),
    });
  };

  const handleSyncNow = async () => {
    const activeMail = connectedEmail || user?.email;
    if (!activeMail) {
      setFeedback({
        visible: true,
        type: 'warning',
        title: 'E-posta Gerekli',
        message: 'Lütfen kargo taraması için bir e-posta adresi bağlayın.',
      });
      return;
    }

    setSyncing(true);
    const results = await EmailSyncService.syncConnectedEmail(user?.id);
    setSyncing(false);

    if (results.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      const shipmentSummary = results.map((r, i) => `${i + 1}. ${r.sender}: ${r.trackingNumber}`).join('\n');

      setFeedback({
        visible: true,
        type: 'success',
        title: t('newShipmentsFoundTitle') || '🎉 Yeni Kargo Tespit Edildi!',
        message: (t('newShipmentsFoundMsg') || 'Son 3 gün içindeki e-postalarınızdan {{count}} adet kargo bulundu:\n\n{{summary}}')
          .replace('{{count}}', String(results.length))
          .replace('{{summary}}', shipmentSummary),
        onConfirm: () => {
          setFeedback((prev) => ({ ...prev, visible: false }));
          if (onShipmentsImported) {
            onShipmentsImported(results);
          }
          onClose();
        },
      });
    } else {
      setFeedback({
        visible: true,
        type: 'info',
        title: t('noNewShipmentsFoundTitle') || 'Kargolarınız Güncel',
        message: t('noNewShipmentsFoundMsg') || 'Son 3 gün içinde taranmamış yeni kargo bildirimi bulunamadı. Önceki kargolarınız zaten listenizde.',
      });
    }
  };

  const handleDisconnect = async () => {
    await EmailSyncService.disconnectEmail();
    setConnectedEmail(null);
    setGoogleProfile(null);
    setEmailInput('');
    setIsEditingCustomEmail(true);
    setFeedback({
      visible: true,
      type: 'info',
      title: t('removeEmailLink') || 'Bağlantı Kesildi',
      message: t('success') || 'İşlem başarılı.',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialIcons name="mark-email-read" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>{t('emailScanModalTitle') || 'E-posta ile Kargo İçe Aktar'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {t('autoImportSubtitle') || 'Son 3 gün içinde gelen kargo ve sipariş bildirimleriniz (Trendyol, Amazon, Hepsiburada, Aras, Yurtiçi vb.) taranıp listenize otomatik eklenir.'}
          </Text>

          {/* Son 3 Gün Filtre Rozeti */}
          <View style={[styles.filterBadge, { backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff', borderColor: isDarkMode ? '#334155' : '#bfdbfe' }]}>
            <MaterialIcons name="access-time" size={16} color={colors.primary} />
            <Text style={[styles.filterBadgeText, { color: colors.primary }]}>
              Son 3 Gün (72 Saat) Aktif Taraması
            </Text>
          </View>

          {connectedEmail && !isEditingCustomEmail ? (
            <View style={styles.connectedCard}>
              <View style={[styles.emailBadgeRow, { backgroundColor: isDarkMode ? '#064e3b' : '#f0fdf4', borderColor: isDarkMode ? '#059669' : '#bbf7d0' }]}>
                {googleProfile?.picture ? (
                  <Image source={{ uri: googleProfile.picture }} style={styles.profileAvatar} />
                ) : (
                  <MaterialIcons name="verified-user" size={22} color="#10b981" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.connectedEmailText, { color: isDarkMode ? '#f9fafb' : colors.onBackground }]} numberOfLines={1}>
                    {googleProfile?.name || user?.user_metadata?.full_name || 'Aktif Hesabınız'}
                  </Text>
                  <Text style={[styles.subEmailText, { color: isDarkMode ? '#a7f3d0' : colors.onSurfaceVariant }]} numberOfLines={1}>
                    {connectedEmail}
                  </Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Bağlı</Text>
                </View>
              </View>

              {/* Tarama Butonu */}
              <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.primary }]}
                onPress={handleSyncNow}
                disabled={syncing}
                activeOpacity={0.8}
              >
                {syncing ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="sync" size={20} color="#ffffff" />
                    <Text style={styles.syncButtonText}>Son 3 Günün Kargolarını Tara</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Farklı E-posta Butonu */}
              <View style={styles.actionLinksRow}>
                <TouchableOpacity onPress={() => setIsEditingCustomEmail(true)}>
                  <Text style={[styles.changeEmailText, { color: colors.primary }]}>Farklı E-posta Gir</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDisconnect}>
                  <Text style={styles.disconnectText}>{t('removeEmailLink') || 'Bağlantıyı Kes'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.inputForm}>
              <Text style={[styles.inputLabel, { color: colors.onSurface }]}>Kargo Bildirim E-postanız:</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outlineVariant,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="ornek@gmail.com"
                placeholderTextColor={colors.onSurfaceVariant}
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveCustomEmail}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#ffffff" />
                    <Text style={styles.syncButtonText}>E-postayı Kaydet & Tara</Text>
                  </>
                )}
              </TouchableOpacity>

              {connectedEmail && (
                <TouchableOpacity onPress={() => setIsEditingCustomEmail(false)} style={{ alignSelf: 'center', marginTop: 4 }}>
                  <Text style={[styles.changeEmailText, { color: colors.primary }]}>Mevcut Hesaba Geri Dön</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Privacy Guarantee Badge */}
          <View style={[styles.privacyBadge, { backgroundColor: isDarkMode ? '#064e3b20' : '#ecfdf5' }]}>
            <MaterialIcons name="security" size={16} color="#047857" />
            <Text style={styles.privacyText}>
              {t('privacyGuaranteeDesc') || 'Gizlilik Garantisi: Yalnızca kargo takip kodları güvenli biçimde taranır. Şifreleriniz veya kişisel mesajlarınız asla okunmaz veya saklanmaz.'}
            </Text>
          </View>
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
            setFeedback((prev) => ({ ...prev, visible: false }));
          }
        }}
        onClose={() => setFeedback((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectedCard: {
    gap: 12,
    marginVertical: 4,
  },
  emailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  connectedEmailText: {
    fontSize: 14,
    fontWeight: '700',
  },
  subEmailText: {
    fontSize: 12,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  changeEmailText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disconnectText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  inputForm: {
    gap: 10,
    marginVertical: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  privacyText: {
    fontSize: 11,
    color: '#065f46',
    flex: 1,
    lineHeight: 15,
  },
});
