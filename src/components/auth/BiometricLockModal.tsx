import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';

interface BiometricLockModalProps {
  visible: boolean;
  onAuthenticate: () => void;
  biometricType?: string;
}

export function BiometricLockModal({ visible, onAuthenticate, biometricType = 'Face ID / Parmak İzi' }: BiometricLockModalProps) {
  const { theme: colors } = useTheme();

  // Kilit ekranı göründüğünde otomatik biyometrik istemciyi başlat
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onAuthenticate();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible, onAuthenticate]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.iconBg, { backgroundColor: colors.primaryContainer }]}>
            <MaterialIcons name="fingerprint" size={56} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.onBackground }]}>KargoTakip Kilitli</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Uygulamaya erişmek için {biometricType} doğrulaması gereklidir.
          </Text>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            onPress={onAuthenticate}
            activeOpacity={0.8}
          >
            <MaterialIcons name="lock-open" size={20} color="#ffffff" />
            <Text style={styles.authButtonText}>Kilidi Aç ({biometricType})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
