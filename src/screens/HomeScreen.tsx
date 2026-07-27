import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import useResponsive from '../hooks/useResponsive';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen, containerPadding, maxContentWidth } = useResponsive();

  return (
    <View style={[styles.container, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          {isLargeScreen && (
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="menu" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          <Text style={styles.appBarTitle}>KargoTakip</Text>
          
          <View style={styles.appBarActions}>
            {isLargeScreen && (
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
                <MaterialIcons name="search" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.iconButton, !isLargeScreen && styles.iconButtonMobile]}
              onPress={() => navigation.navigate('AddPackage')}
            >
              <MaterialIcons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent, 
          // add padding bottom for bottom nav if on mobile
          { paddingBottom: isLargeScreen ? 24 : insets.bottom + 80 }
        ]}
      >
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={isLargeScreen ? styles.welcomeTitleLarge : styles.welcomeTitle}>Merhaba, Ahmet!</Text>
          <Text style={styles.welcomeSubtitle}>Bugün kargolarınızın durumunu takip edin.</Text>
        </View>

        {/* Stats Row (Bento Grid Style) */}
        <View style={styles.statsRow}>
          {/* Teslim Edilen */}
          <View style={[styles.statCard, styles.statCardSmall]}>
            <View style={styles.statIconWrapper}>
              <MaterialIcons name="check-circle" size={24} color={colors.tertiaryFixedDim} />
            </View>
            <View>
              <Text style={styles.statLabel}>Teslim Edilen</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
          </View>

          {/* Bekleyen */}
          <View style={[styles.statCard, styles.statCardSmall]}>
            <View style={styles.statIconWrapper}>
              <MaterialIcons name="pending" size={24} color={colors.secondaryFixedDim || '#ffb95f'} />
            </View>
            <View>
              <Text style={styles.statLabel}>Bekleyen</Text>
              <Text style={styles.statValue}>3</Text>
            </View>
          </View>

          {/* Dağıtımda */}
          <View style={[styles.statCard, styles.statCardLarge, isLargeScreen && styles.statCardLargeDesktop]}>
            {/* Background Icon Decoration */}
            <View style={styles.statCardBgIcon}>
              <MaterialIcons name="local-shipping" size={80} color={colors.onPrimaryContainer} />
            </View>
            
            <View style={styles.statIconWrapper}>
              <MaterialIcons name="local-shipping" size={24} color={colors.onPrimaryContainer} />
            </View>
            <View>
              <Text style={styles.statLabelLight}>Dağıtımda</Text>
              <Text style={styles.statValueLight}>1</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={styles.primaryActionBtn} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddPackage')}
          >
            <MaterialIcons name="add-box" size={24} color={colors.onPrimary} />
            <Text style={styles.primaryActionText}>Paket Ekle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryActionBtn} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddPackage')}
          >
            <MaterialIcons name="qr-code-scanner" size={24} color={colors.primary} />
            <Text style={styles.secondaryActionText}>QR Tara</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Packages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Kargolar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Packages')}>
              <Text style={styles.seeAllLink}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.packageList}>
            {/* Package 1 (In Transit) */}
            <TouchableOpacity style={styles.packageCard} activeOpacity={0.7}>
              <View style={styles.packageInfoWrapper}>
                <View style={styles.packageIconBg}>
                  <MaterialIcons name="storefront" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.packageName}>Aras Kargo</Text>
                  <Text style={styles.packageCode}>TR1234567890</Text>
                </View>
              </View>
              
              <View style={styles.packageStatusWrapper}>
                {/* Mobile Progress Bar (Mockup simulation) */}
                {!isLargeScreen && (
                  <View style={styles.mobileProgressLine}>
                    <View style={[styles.mobileProgressFill, { width: '66%', backgroundColor: colors.secondaryContainer }]} />
                  </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: colors.secondaryFixed }]}>
                  <Text style={[styles.statusBadgeText, { color: colors.onSecondaryFixedVariant }]}>Dağıtımda</Text>
                </View>
              </View>
              
              {/* Desktop Stepper */}
              {isLargeScreen && (
                <View style={styles.desktopStepper}>
                  <View style={styles.stepperLine}>
                    <View style={[styles.stepperLineFill, { width: '66%', backgroundColor: colors.tertiaryFixedDim }]} />
                    <View style={[styles.stepperDot, { left: 0, backgroundColor: colors.tertiaryFixedDim }]} />
                    <View style={[styles.stepperDot, { left: '33%', backgroundColor: colors.tertiaryFixedDim }]} />
                    <View style={[styles.stepperDot, { left: '66%', backgroundColor: colors.secondaryContainer, borderWidth: 4, borderColor: '#f8f9ff', width: 16, height: 16, top: -6 }]} />
                    <View style={[styles.stepperDot, { right: 0, backgroundColor: colors.surfaceVariant }]} />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Package 2 (Delivered) */}
            <TouchableOpacity style={[styles.packageCard, { opacity: 0.8 }]} activeOpacity={0.7}>
              <View style={styles.packageInfoWrapper}>
                <View style={styles.packageIconBg}>
                  <MaterialIcons name="local-shipping" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.packageName}>Yurtiçi Kargo</Text>
                  <Text style={styles.packageCode}>YK9876543210</Text>
                </View>
              </View>
              
              <View style={styles.packageStatusWrapper}>
                {!isLargeScreen && (
                  <View style={styles.mobileProgressLine}>
                    <View style={[styles.mobileProgressFill, { width: '100%', backgroundColor: colors.tertiaryFixedDim }]} />
                  </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: colors.surfaceContainerHigh }]}>
                  <Text style={[styles.statusBadgeText, { color: colors.onSurfaceVariant }]}>Teslim Edildi</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Area */}
        <View style={styles.decorativeSection}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv6yaTJh2Sqew9azrpGm2OODE1IgDdZZwCsE3iZZmidEGeMeLlqs710l8lRCvbp1s_Ys3LJR0waYCn9PKCnGtvQoLNsCNC6NPaqxyVrHKHbY1Fk0sJ2LcVBqh3E9ceWMsAWdjBGm4Ofjbjey5QIx04hlnvAhz8q6puM6up4-9Sz6ag09ig1LMiM863isjpsr-e8AkPBJpwb1zpjyFZxzzig7IoeGQiAPLhtbzQfDVCwin2Hm4s3EhZatnPTk7g478uIv8yFJ836JQ' }}
            style={styles.decorativeImage}
            imageStyle={{ opacity: 0.3 }}
          >
            <Text style={styles.decorativeText}>
              Tüm kargolarınız tek bir yerde, güvenle takipte.
            </Text>
          </ImageBackground>
        </View>

      </ScrollView>

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
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
    // Add shadow
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
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  iconButtonMobile: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.24,
    color: colors.primary,
  },
  welcomeTitleLarge: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.64,
    color: colors.primary,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    borderRadius: 12,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    // shadow
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statCardSmall: {
    flex: 1,
    minWidth: '45%',
  },
  statCardLarge: {
    width: '100%',
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryFixed,
    position: 'relative',
    overflow: 'hidden',
    shadowOpacity: 0.12,
  },
  statCardLargeDesktop: {
    flex: 1, // On desktop it shares the row with the others
  },
  statIconWrapper: {
    marginBottom: 16,
  },
  statCardBgIcon: {
    position: 'absolute',
    right: -16,
    top: -16,
    opacity: 0.2,
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
  },
  statLabelLight: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.onPrimaryContainer,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: colors.onBackground,
    marginTop: 4,
  },
  statValueLight: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: colors.onPrimary,
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.onBackground,
  },
  seeAllLink: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.primary,
  },
  packageList: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
  },
  packageInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  packageIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onBackground,
  },
  packageCode: {
    fontFamily: 'Courier Prime', // Make sure to load this font if you want mono style
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  packageStatusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileProgressLine: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    marginRight: 16,
    overflow: 'hidden',
  },
  mobileProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  desktopStepper: {
    flex: 1,
    marginHorizontal: 32,
    justifyContent: 'center',
  },
  stepperLine: {
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    position: 'relative',
    width: '100%',
  },
  stepperLineFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 2,
  },
  stepperDot: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  decorativeSection: {
    marginTop: 32,
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.inverseSurface,
    // Add shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  decorativeImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  decorativeText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.onPrimary,
    textAlign: 'center',
    maxWidth: '90%',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimaryContainer,
    marginTop: 4,
  },
});

export default HomeScreen;
