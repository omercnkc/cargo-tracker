import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { EmailSyncService, EmailScanResult } from '../../services/import/emailSyncService';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { ModernFeedbackModal, FeedbackType } from '../common/ModernFeedbackModal';

interface EmailConnectModalProps {
  visible: boolean;
  onClose: () => void;
  onShipmentsImported?: (shipments: EmailScanResult[]) => void;
}

export function EmailConnectModal({ visible, onClose, onShipmentsImported }: EmailConnectModalProps) {
  const { theme: colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [emailInput, setEmailInput] = useState('');
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
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
      EmailSyncService.getConnectedEmail().then((mail) => {
        setConnectedEmail(mail);
        if (mail) setEmailInput(mail);
      });
    }
  }, [visible]);

  const handleConnect = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setFeedback({
        visible: true,
        type: 'warning',
        title: 'Geçersiz E-Posta',
        message: 'Lütfen geçerli bir e-posta adresi girin.',
      });
      return;
    }

    setLoading(true);
    const success = await EmailSyncService.connectEmail(emailInput);
    setLoading(false);

    if (success) {
      setConnectedEmail(emailInput);
      setFeedback({
        visible: true,
        type: 'success',
        title: 'E-Posta Bağlandı 📧',
        message: `${emailInput} hesabı başarıyla bağlandı. Artık yeni kargolarınız otomatik taranacak.`,
      });
    }
  };

  const handleSyncNow = async () => {
    if (!connectedEmail) return;

    setSyncing(true);
    const results = await EmailSyncService.syncConnectedEmail(user?.id);
    setSyncing(false);

    if (results.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      const shipmentSummary = results.map((r, i) => `${i + 1}. ${r.sender}: ${r.trackingNumber}`).join('\n');

      setFeedback({
        visible: true,
        type: 'success',
        title: '🎉 Yeni Kargolar Bulundu!',
        message: `E-postanızda ${results.length} adet yeni kargo bildirimi tespit edildi ve kargo listenize eklendi:\n\n${shipmentSummary}`,
        onConfirm: () => {
          setFeedback(prev => ({ ...prev, visible: false }));
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
        title: 'Kargo Güncel',
        message: 'E-postanızda taranmamış yeni kargo bildirimi bulunamadı. Önceki kargolarınız zaten listenizde.',
      });
    }
  };

  const handleDisconnect = async () => {
    await EmailSyncService.disconnectEmail();
    setConnectedEmail(null);
    setEmailInput('');
    setFeedback({
      visible: true,
      type: 'info',
      title: 'Bağlantı Kesildi',
      message: 'E-posta hesabı bağlantısı kaldırıldı ve kayıtlar temizlendi.',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialIcons name="email" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>E-Posta Kargo Taraması</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            Trendyol, Hepsiburada, Amazon gibi mağazalardan gelen *"Paketiniz kargoya verildi"* e-postaları otomatik taranır ve listenize eklenir.
          </Text>

          {connectedEmail ? (
            <View style={styles.connectedCard}>
              <View style={styles.emailBadgeRow}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={[styles.connectedEmailText, { color: colors.onBackground }]}>{connectedEmail}</Text>
              </View>

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
                    <Text style={styles.syncButtonText}>E-Postaları Şimdi Tara</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Text style={styles.disconnectText}>E-Posta Bağlantısını Kaldır</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputForm}>
              <TextInput
                style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onBackground }]}
                placeholder="ornek@gmail.com"
                placeholderTextColor={colors.onSurfaceVariant}
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.connectButton, { backgroundColor: colors.primary }]}
                onPress={handleConnect}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="link" size={20} color="#ffffff" />
                    <Text style={styles.connectButtonText}>E-Posta Hesabını Bağla</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy Guarantee Badge */}
          <View style={styles.privacyBadge}>
            <MaterialIcons name="security" size={16} color="#047857" />
            <Text style={styles.privacyText}>
              🛡️ Gizlilik Garantisi: Sadece kargo bildirim başlıkları taranır, kişisel verileriniz saklanmaz.
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
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  connectedCard: {
    gap: 12,
    marginVertical: 8,
  },
  emailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  connectedEmailText: {
    fontSize: 14,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  disconnectText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  inputForm: {
    gap: 12,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  privacyText: {
    fontSize: 11,
    color: '#065f46',
    flex: 1,
  },
});
