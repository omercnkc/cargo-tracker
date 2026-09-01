import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { ModernFeedbackModal, FeedbackType } from './ModernFeedbackModal';
import { styles } from './SupportHelpModal.styles';
import { hapticService } from '../../services/haptics.service';

export type SupportModalType = 'help' | 'rate' | 'feedback' | 'privacy' | 'terms';

interface SupportHelpModalProps {
  visible: boolean;
  type: SupportModalType;
  onClose: () => void;
}

export function SupportHelpModal({ visible, type, onClose }: SupportHelpModalProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

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

  const getModalConfig = () => {
    switch (type) {
      case 'help':
        return {
          icon: 'help-outline',
          title: t('supportHelpTitle'),
          content: (
            <View style={styles.contentGroup}>
              <Text style={[styles.qText, { color: colors.onSurface }]}>{t('supportHelpQ1')}</Text>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportHelpA1')}</Text>
              
              <Text style={[styles.qText, { color: colors.onSurface }]}>{t('supportHelpQ2')}</Text>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportHelpA2')}</Text>
              
              <Text style={[styles.qText, { color: colors.onSurface }]}>{t('supportHelpQ3')}</Text>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportHelpA3')}</Text>
            </View>
          ),
        };
      case 'privacy':
        return {
          icon: 'shield',
          title: t('supportPrivacyTitle'),
          content: (
            <View style={styles.contentGroup}>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportPrivacyDesc')}</Text>
              <Text style={[styles.qText, { color: colors.onSurface }]}>{t('supportPrivacyQ1')}</Text>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportPrivacyA1')}</Text>
              <Text style={[styles.qText, { color: colors.onSurface }]}>{t('supportPrivacyQ2')}</Text>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportPrivacyA2')}</Text>
            </View>
          ),
        };
      case 'terms':
        return {
          icon: 'description',
          title: t('supportTermsTitle'),
          content: (
            <View style={styles.contentGroup}>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportTermsDesc')}</Text>
              <Text style={[styles.qText, { color: colors.onSurface }]}>{t('supportTermsQ1')}</Text>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportTermsA1')}</Text>
              <Text style={[styles.qText, { color: colors.onSurface }]}>{t('supportTermsQ2')}</Text>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportTermsA2')}</Text>
            </View>
          ),
        };
      case 'feedback':
        return {
          icon: 'chat-bubble-outline',
          title: t('supportFeedbackTitle'),
          content: (
            <View style={styles.contentGroup}>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportFeedbackDesc')}</Text>
              <TouchableOpacity
                style={[styles.actionPillBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  hapticService.success();
                  setFeedback({
                    visible: true,
                    type: 'success',
                    title: t('supportFeedbackSuccessTitle'),
                    message: t('supportFeedbackSuccessMsg'),
                    onConfirm: () => {
                      setFeedback(prev => ({ ...prev, visible: false }));
                      onClose();
                    },
                  });
                }}
              >
                <MaterialIcons name="send" size={18} color="#ffffff" />
                <Text style={styles.actionPillText}>{t('supportFeedbackBtn')}</Text>
              </TouchableOpacity>
            </View>
          ),
        };
      default:
        return {
          icon: 'star-outline',
          title: t('supportRateTitle'),
          content: (
            <View style={styles.contentGroup}>
              <Text style={[styles.aText, { color: colors.onSurfaceVariant }]}>{t('supportRateDesc')}</Text>
              <TouchableOpacity
                style={[styles.actionPillBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  hapticService.success();
                  setFeedback({
                    visible: true,
                    type: 'success',
                    title: t('supportRateSuccessTitle'),
                    message: t('supportRateSuccessMsg'),
                    onConfirm: () => {
                      setFeedback(prev => ({ ...prev, visible: false }));
                      onClose();
                    },
                  });
                }}
              >
                <MaterialIcons name="star" size={20} color="#f59e0b" />
                <Text style={styles.actionPillText}>{t('supportRateBtn')}</Text>
              </TouchableOpacity>
            </View>
          ),
        };
    }
  };

  const config = getModalConfig();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialIcons name={config.icon as any} size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>{config.title}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              hapticService.buttonPress();
              onClose();
            }} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {config.content}
          </ScrollView>

          <TouchableOpacity style={[styles.footerCloseBtn, { backgroundColor: colors.primary }]} onPress={() => {
            hapticService.buttonPress();
            onClose();
          }}>
            <Text style={[styles.footerCloseBtnText, { color: colors.onPrimary }]}>{t('close')}</Text>
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

export default SupportHelpModal;
