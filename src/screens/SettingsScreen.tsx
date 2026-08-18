import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../store/auth.store';
import { useDrawerStore } from '../store/drawer.store';
import { useTheme } from '../theme/useTheme';
import { useSettingsStore } from '../store/settings.store';
import { useTranslation } from '../hooks/useTranslation';
import { EmailConnectModal } from '../components/import/EmailConnectModal';
import { hapticService } from '../services/haptics.service';
import { styles } from './SettingsScreen.styles';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const signOut = useAuthStore((state) => state.signOut);

  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [pushEnabled, setPushEnabled] = useState(true);
  const { hapticsEnabled, setHapticsEnabled } = useSettingsStore();
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  const handleHapticsToggle = async (value: boolean) => {
    setHapticsEnabled(value);
    if (value) {
      hapticService.success();
    }
  };

  const handleSignOut = async () => {
    hapticService.buttonPress();
    await signOut();
  };

  const openChangePasswordModal = () => {
    hapticService.buttonPress();
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.surfaceContainer }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            hapticService.buttonPress();
            openDrawer();
          }}>
            <MaterialIcons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('settings')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.layoutWrapper}>
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[
            styles.mainContent,
            { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>{t('settings')}</Text>

          <View style={styles.gridContainer}>

            {/* Security Section */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainer }]}>
                <MaterialIcons name="security" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('security')}</Text>
              </View>

              <View style={styles.sectionBody}>
                <TouchableOpacity
                  style={[styles.settingRow, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={openChangePasswordModal}
                >
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.onSurface }]}>{t('changePassword')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>
                      {t('changePasswordDesc')}
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
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('autoScanTitle')}</Text>
              </View>

              <View style={styles.sectionBody}>
                <TouchableOpacity
                  style={[styles.settingRow, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => setEmailModalVisible(true)}
                >
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.onSurface }]}>{t('connectEmailTitle')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>
                      {t('connectEmailDesc')}
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
                <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(197, 197, 211, 0.3)' }]}>
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

                {/* Haptic Feedback */}
                <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.settingTextContent}>
                    <Text style={[styles.settingLabel, { color: colors.onSurface }]}>{t('hapticFeedback')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>{t('hapticFeedbackDesc')}</Text>
                  </View>
                  <Switch
                    trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                    thumbColor={'#ffffff'}
                    onValueChange={handleHapticsToggle}
                    value={hapticsEnabled}
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

export default SettingsScreen;
