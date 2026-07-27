import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkEnabled, setDarkEnabled] = useState(false);

  return (
    <View style={styles.container}>
      
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>KargoTakip</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AddPackage')}>
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.layoutWrapper}>
        
        {/* Desktop Sidebar (Rendered only on large screens) */}
        {isLargeScreen && (
          <View style={styles.sidebar}>
            <TouchableOpacity style={styles.sidebarItem}>
              <MaterialIcons name="home" size={24} color={colors.onSurfaceVariant} />
              <Text style={styles.sidebarItemText}>Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.sidebarItem}>
              <MaterialIcons name="inventory" size={24} color={colors.onSurfaceVariant} />
              <Text style={styles.sidebarItemText}>Packages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.sidebarItem}>
              <MaterialIcons name="leaderboard" size={24} color={colors.onSurfaceVariant} />
              <Text style={styles.sidebarItemText}>Statistics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.sidebarItemActive}>
              <MaterialIcons name="settings" size={24} color={colors.primaryContainer} />
              <Text style={styles.sidebarItemTextActive}>Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content */}
        <ScrollView 
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.mainContent,
            { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
          ]}
        >
          <Text style={styles.pageTitle}>Settings</Text>

          <View style={styles.gridContainer}>
            
            {/* Preferences Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="tune" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Preferences</Text>
              </View>

              <View style={styles.sectionBody}>
                {/* Push Notifications */}
                <View style={styles.settingRow}>
                  <View style={styles.settingTextContent}>
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Text style={styles.settingDesc}>Get real-time tracking updates</Text>
                  </View>
                  <Switch
                    trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                    thumbColor={'#ffffff'}
                    onValueChange={setPushEnabled}
                    value={pushEnabled}
                  />
                </View>

                {/* Email Alerts */}
                <View style={styles.settingRow}>
                  <View style={styles.settingTextContent}>
                    <Text style={styles.settingLabel}>Email Alerts</Text>
                    <Text style={styles.settingDesc}>Receive daily tracking summaries</Text>
                  </View>
                  <Switch
                    trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                    thumbColor={'#ffffff'}
                    onValueChange={setEmailEnabled}
                    value={emailEnabled}
                  />
                </View>

                {/* Dark Mode */}
                <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.settingTextContent}>
                    <Text style={styles.settingLabel}>Dark Mode</Text>
                    <Text style={styles.settingDesc}>Adjust app appearance</Text>
                  </View>
                  <Switch
                    trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                    thumbColor={'#ffffff'}
                    onValueChange={setDarkEnabled}
                    value={darkEnabled}
                  />
                </View>
              </View>
            </View>

            {/* Language & Region Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="language" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Language & Region</Text>
              </View>
              
              <View style={styles.sectionBodyPad}>
                <Text style={styles.inputLabel}>Display Language</Text>
                
                {/* Custom simulated select dropdown */}
                <TouchableOpacity style={styles.dropdownPicker} activeOpacity={0.7}>
                  <Text style={styles.dropdownText}>English (US)</Text>
                  <MaterialIcons name="expand-more" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>

            {/* About Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="info" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>About</Text>
              </View>

              <View style={styles.sectionBody}>
                <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                  <Text style={styles.settingLabel}>Terms of Service</Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.settingLabel}>App Version</Text>
                  <Text style={styles.versionText}>v2.4.1 (Build 8492)</Text>
                </View>
              </View>
            </View>

            {/* Support Illustration */}
            <View style={styles.supportCard}>
              <View style={styles.supportIconContainer}>
                <MaterialIcons name="support-agent" size={40} color={colors.primary} />
              </View>
              <Text style={styles.supportTitle}>Need Help?</Text>
              <Text style={styles.supportDesc}>Our support team is available 24/7 to assist with your shipments.</Text>
              
              <TouchableOpacity style={styles.supportButton} activeOpacity={0.8}>
                <Text style={styles.supportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    backgroundColor: colors.surface,
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
    color: colors.primary,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  layoutWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 256, // 64 * 4 = 256
    backgroundColor: colors.surfaceContainerLowest,
    borderRightWidth: 1,
    borderRightColor: 'rgba(197, 197, 211, 0.3)',
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sidebarItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 58, 138, 0.2)', // primary-container/20 roughly
  },
  sidebarItemText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  sidebarItemTextActive: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryContainer,
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 16, // margin-mobile
    paddingTop: 32, // py-8
    maxWidth: 896, // max-w-4xl
    alignSelf: 'center',
    width: '100%',
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24, // headline-lg-mobile
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  sectionCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
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
    backgroundColor: 'rgba(229, 238, 255, 0.5)', // surface-container-low/50 roughly
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.3)',
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  sectionBody: {
    // container for rows
  },
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
    color: colors.onSurface,
  },
  settingDesc: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  dropdownPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurface,
  },
  versionText: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  supportCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainer, // base color for gradient
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 250,
  },
  supportIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30, 58, 138, 0.2)', // primary-container/20
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  supportTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 8,
  },
  supportDesc: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 320,
  },
  supportButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  supportButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimary,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant + '4D',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: 999,
  },
  navText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimaryContainer,
    marginTop: 4,
  },
});

export default SettingsScreen;
