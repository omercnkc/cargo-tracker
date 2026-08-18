import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { hapticService } from '../../services/haptics.service';
import { styles } from './ModernFeedbackModal.styles';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

export interface ModernFeedbackModalProps {
  visible: boolean;
  type?: FeedbackType;
  title: string;
  message: string;
  trackingNumber?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const ModernFeedbackModal: React.FC<ModernFeedbackModalProps> = ({
  visible,
  type = 'success',
  title,
  message,
  trackingNumber,
  primaryButtonText = 'Tamam',
  secondaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
}) => {
  const { theme: colors } = useTheme();

  if (!visible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: '#ECFDF5',
          iconColor: '#10B981',
          iconName: 'check-circle' as const,
          badgeBorder: '#A7F3D0',
        };
      case 'error':
        return {
          iconBg: '#FEE2E2',
          iconColor: '#EF4444',
          iconName: 'error' as const,
          badgeBorder: '#FCA5A5',
        };
      case 'warning':
        return {
          iconBg: '#FFF5E5',
          iconColor: '#D97706',
          iconName: 'warning' as const,
          badgeBorder: '#FDE68A',
        };
      case 'info':
      default:
        return {
          iconBg: '#E0F2FE',
          iconColor: '#0284C7',
          iconName: 'info' as const,
          badgeBorder: '#BAE6FD',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              
              {/* Top Icon Badge */}
              <View style={[styles.iconRing, { backgroundColor: config.iconBg, borderColor: config.badgeBorder }]}>
                <MaterialIcons name={config.iconName} size={36} color={config.iconColor} />
              </View>

              {/* Title & Description */}
              <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>{message}</Text>

              {/* Optional Tracking Code Pill */}
              {trackingNumber ? (
                <View style={styles.trackingContainer}>
                  <MaterialCommunityIcons name="package-variant-closed" size={20} color={colors.primary} />
                  <Text style={[styles.trackingText, { color: colors.primary }]}>{trackingNumber}</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {secondaryButtonText && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton, { borderColor: colors.outlineVariant }]}
                    onPress={() => {
                      hapticService.buttonPress();
                      onSecondaryAction ? onSecondaryAction() : onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>
                      {secondaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: colors.primary },
                    secondaryButtonText ? { flex: 1 } : { width: '100%' },
                  ]}
                  onPress={() => {
                    hapticService.buttonPress();
                    onPrimaryAction();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModernFeedbackModal;
