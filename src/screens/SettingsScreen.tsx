import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useWindowDimensions,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthStore } from '../store/auth.store';
import { useBiometrics } from '../hooks/useBiometrics';
import { useModalStore } from '../store/modal.store';
import { EmailConnectModal } from '../components/import/EmailConnectModal';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const signOut = useAuthStore(state => state.signOut);
  const { isSupported, isEnabled, biometricTypes, toggleBiometric } = useBiometrics();
  const openChangePasswordModal = useModalStore(state => state.openChangePasswordModal);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  const handleBiometricToggle = async (value: boolean) => {
    const success = await toggleBiometric(value);
    if (value && !success) {
      Alert.alert(t('authFailedTitle'), t('biometricEnableFailed'));
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('signOut'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('appName')}</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.layoutWrapper}>
        {/* Main Content */}
        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.mainContent,
            { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
          ]}
        >
          <Text style={[styles.pageTitle, { color: colors.primary }]}>{t('settings')}</Text>

          <View style={styles.gridContainer}>

            {/* Security Section (Biometrics & Change Password) */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainer }]}>
                <MaterialIcons name="security" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('securityAndBiometrics')}</Text>
              </View>

              <View style={styles.sectionBody}>
                {/* Biyometrik Giriş */}
                <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(197, 197, 211, 0.3)' }]}>
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.onSurface }]}>
                      {biometricTypes[0] ? `${t('biometricLoginTitle')} ${biometricTypes[0]}` : `${t('biometricLoginTitle')} Face ID / Touch ID`}
                    </Text>
                    <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>
                      {isSupported
                        ? t('biometricRequireAppOpen')
                        : t('biometricNotSupported')}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                    thumbColor={'#ffffff'}
                    onValueChange={handleBiometricToggle}
                    value={isEnabled}
                    disabled={!isSupported}
                  />
                </View>

                {/* Şifre Değiştir */}
                <TouchableOpacity
                  style={[styles.settingRow, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={openChangePasswordModal}
                >
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.onSurface }]}>{t('changePassword')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>
                      Hesap şifrenizi yenileyin veya güncelleyin
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Auto Mail Import Section */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainer }]}>
                <MaterialIcons name="mark-email-read" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Otomatik Kargo Taraması</Text>
              </View>

              <View style={styles.sectionBody}>
                <TouchableOpacity
                  style={[styles.settingRow, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => setEmailModalVisible(true)}
                >
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.onSurface }]}>E-Posta Hesabını Bağla</Text>
                    <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>
                      Trendyol, Hepsiburada ve Amazon'dan gelen "Paketiniz kargoya verildi" maillerini otomatik tara
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Preferences Section */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainer }]}>
                <MaterialIcons name="tune" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('preferences')}</Text>
              </View>

              <View style={styles.sectionBody}>
                {/* Push Notifications */}
                <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.onSurface }]}>{t('pushNotifications')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>{t('pushNotificationsDesc')}</Text>
                  </View>
                  <Switch
                    trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                    thumbColor={'#ffffff'}
                    onValueChange={setPushEnabled}
                    value={pushEnabled}
                  />
                </View>
              </View>
            </View>

            {/* Account Section */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainer }]}>
                <MaterialIcons name="person" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('account')}</Text>
              </View>

              <View style={styles.sectionBody}>
                <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={handleSignOut}>
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.error }]}>{t('signOut')}</Text>
                  </View>
                  <MaterialIcons name="logout" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </View>

      {/* Email Connect Modal */}
      <EmailConnectModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 40,
  },
  appBarContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  layoutWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    maxWidth: 896,
    alignSelf: 'center',
    width: '100%',
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  gridContainer: {
    gap: 24,
  },
  sectionCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.3)',
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionBody: {},
  sectionBodyPad: {
    padding: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.3)',
  },
  settingTextContent: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
  },
  settingDesc: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 4,
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginBottom: 12,
  },
  langBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c5c5d3',
    alignItems: 'center',
  },
  langBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
  },
});

export default SettingsScreen;
