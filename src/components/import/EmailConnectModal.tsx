import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { EmailSyncService, EmailScanResult } from '../../services/import/emailSyncService';
import { GoogleAuthService, GoogleUserProfile } from '../../services/import/googleAuthService';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { ModernFeedbackModal, FeedbackType } from '../common/ModernFeedbackModal';
import { GoogleLogo } from '../common/GoogleLogo';
import { useTranslation } from '../../hooks/useTranslation';

WebBrowser.maybeCompleteAuthSession();

// Gmail API erişimi için Google OAuth Client ID'leri
// NOT: Bu akış kullanıcı girişiyle değil, Gmail okuma izniyle ilgilidir.
const GMAIL_OAUTH = {
  androidClientId: '624428912304-756s6lfo6tumina9rfa3kcq2h5dotk28.apps.googleusercontent.com',
  iosClientId: '624428912304-1jfiuhjc0iv93snrt09legt4lb2ip4rn.apps.googleusercontent.com',
  webClientId: '624428912304-4lqg8t28d6k7ht3scraghea6khmjat1n.apps.googleusercontent.com',
  scopes: ['openid', 'profile', 'email'],
};

interface EmailConnectModalProps {
  visible: boolean;
  onClose: () => void;
  onShipmentsImported?: (shipments: EmailScanResult[]) => void;
}

export function EmailConnectModal({ visible, onClose, onShipmentsImported }: EmailConnectModalProps) {
  const { theme: colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [emailInput, setEmailInput] = useState('');
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<GoogleUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GMAIL_OAUTH.androidClientId,
    iosClientId: GMAIL_OAUTH.iosClientId,
    webClientId: GMAIL_OAUTH.webClientId,
    scopes: GMAIL_OAUTH.scopes,
  });

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
      setConnectedEmail(mail);
      if (mail) setEmailInput(mail);
    }
  };

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      handleGoogleAuthSuccess(response.authentication.accessToken);
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (token: string) => {
    setLoading(true);
    await GoogleAuthService.saveAccessToken(token);
    const profile = await GoogleAuthService.fetchUserProfileFromGoogle(token);

    if (profile) {
      await GoogleAuthService.saveUserProfile(profile);
      await EmailSyncService.connectEmail(profile.email);
      setGoogleProfile(profile);
      setConnectedEmail(profile.email);

      setFeedback({
        visible: true,
        type: 'success',
        title: t('googleConnectedTitle'),
        message: t('googleConnectedMsg').replace('{{email}}', profile.email),
      });
    } else {
      setFeedback({
        visible: true,
        type: 'error',
        title: t('googleAuthErrorTitle'),
        message: t('googleAuthErrorMsg'),
      });
    }
    setLoading(false);
  };

  const handleGoogleLoginPrompt = () => {
    if (request) {
      promptAsync();
    } else {
      setFeedback({
        visible: true,
        type: 'warning',
        title: t('googleServicePreparingTitle'),
        message: t('googleServicePreparingMsg'),
      });
    }
  };

  const handleManualConnect = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setFeedback({
        visible: true,
        type: 'warning',
        title: t('invalidEmailTitle'),
        message: t('invalidEmailMsg'),
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
        title: t('emailSavedTitle'),
        message: t('emailSavedMsg').replace('{{email}}', emailInput),
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
        title: t('newShipmentsFoundTitle'),
        message: t('newShipmentsFoundMsg').replace('{{count}}', String(results.length)).replace('{{summary}}', shipmentSummary),
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
        title: t('noNewShipmentsFoundTitle'),
        message: t('noNewShipmentsFoundMsg'),
      });
    }
  };

  const handleDisconnect = async () => {
    await EmailSyncService.disconnectEmail();
    setConnectedEmail(null);
    setGoogleProfile(null);
    setEmailInput('');
    setFeedback({
      visible: true,
      type: 'info',
      title: t('removeEmailLink'),
      message: t('success'),
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
              <Text style={[styles.title, { color: colors.primary }]}>{t('emailScanModalTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {t('autoImportSubtitle')}
          </Text>

          {connectedEmail ? (
            <View style={styles.connectedCard}>
              <View style={styles.emailBadgeRow}>
                {googleProfile?.picture ? (
                  <Image source={{ uri: googleProfile.picture }} style={styles.profileAvatar} />
                ) : (
                  <MaterialIcons name="check-circle" size={20} color="#10b981" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.connectedEmailText, { color: colors.onBackground }]}>
                    {googleProfile?.name || connectedEmail}
                  </Text>
                  <Text style={[styles.subEmailText, { color: colors.onSurfaceVariant }]}>{connectedEmail}</Text>
                </View>
                {googleProfile && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>{t('googleVerified')}</Text>
                  </View>
                )}
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
                    <Text style={styles.syncButtonText}>{t('scanGmailNow')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Text style={styles.disconnectText}>{t('removeEmailLink')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputForm}>
              {/* Google ile Bağlan Butonu */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLoginPrompt}
                disabled={loading || !request}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#374151" size="small" />
                ) : (
                  <>
                    <GoogleLogo size={22} />
                    <Text style={styles.googleButtonText}>{t('connectGoogleLive')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy Guarantee Badge */}
          <View style={styles.privacyBadge}>
            <MaterialIcons name="security" size={16} color="#047857" />
            <Text style={styles.privacyText}>
              {t('privacyGuaranteeDesc')}
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
    gap: 10,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
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
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  connectButtonText: {
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
