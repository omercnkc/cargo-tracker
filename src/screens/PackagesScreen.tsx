import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  useWindowDimensions,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import useResponsive from '../hooks/useResponsive';

export const PackagesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();

  return (
    <View style={[styles.container, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="menu" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          
          <Text style={styles.appBarTitle}>KargoTakip</Text>
          
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="add" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent, 
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 } // Space for bottom nav & FAB
        ]}
      >
        {/* Header & Search Area */}
        <View style={styles.headerSection}>
          <Text style={isLargeScreen ? styles.pageTitleLarge : styles.pageTitle}>Active Packages</Text>
          
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIconLeft} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search tracking number or company..."
              placeholderTextColor={colors.outlineVariant}
            />
            <TouchableOpacity style={styles.searchIconRight}>
              <MaterialIcons name="filter-list" size={20} color={colors.outline} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Package List (Grid on Desktop) */}
        <View style={styles.packageGrid}>
          
          {/* Card 1: In Transit */}
          <TouchableOpacity style={[styles.card, isLargeScreen && styles.cardDesktop]} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.companyLogoBg}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQAYJqGOz9kirXFakdn6xML_KFwHoJ2AJzf-LABWag5ontXgnBPLXxI192uHGnjtuk1Hxtu-RPvkgWi0FBe9hxBGpkREvyF-yGAGETdnOiW_Anjj5uxVbdY_4bphH45OozbEFmwKUcPL_IUaiv_kQ9ytX8zYZN6Rjyf-niXHs8wnoifbWzkzkiNk9XR2LgbV4Wi156KAbDz5St-Hj_eU3BHdztDN5j4hzSUGx41fUlqY5txG6DkkVfv-TWr8LO_vNfc0oDWmNgiDY' }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.trackingNumber}>KP8943271105</Text>
                  <Text style={styles.companyName}>Global Express</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.secondaryContainer, borderColor: colors.secondaryFixed }]}>
                <Text style={[styles.badgeText, { color: colors.onSecondaryContainer }]}>In Transit</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeText}>Origin: SHZ</Text>
                <Text style={styles.routeText}>Dest: BER</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '65%', backgroundColor: colors.secondaryContainer }]} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>Estimated Delivery</Text>
                <Text style={styles.footerValuePrimary}>Oct 24, 2023</Text>
              </View>
              <View style={styles.footerAction}>
                <Text style={styles.footerActionText}>Details</Text>
                <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Delivered */}
          <TouchableOpacity style={[styles.card, isLargeScreen && styles.cardDesktop]} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.companyLogoBg}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDndS9Xc59oX3WY735_crAmXQ57-GM1fOr2dpm7X82EOQi_wrJYw-pezBidOWHCa5k2Jy1QwtHqXyIABwy5DXMNneud1hVTvgLgVAXu0tIpyFM5yXixn4oLdsd9Tx8vvrITOEE58KWT8S-4-o6DUn-AZC0lkllVys5M0fxjZ5uZ5Ua6NrZA9PNoMvaOzlJcX2YxYivdZlnA8-We-T7hLcjvmmqA9xl7THZHNToHPMHiUGTg-sN5OTNsTIi5wCXOW9ahAtLQ_qb-4rk' }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.trackingNumber}>TR1029384756</Text>
                  <Text style={styles.companyName}>National Post</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: '#e6f4ea', borderColor: '#ceead6' }]}>
                <Text style={[styles.badgeText, { color: colors.tertiaryContainer }]}>Delivered</Text>
              </View>
            </View>

            <View style={[styles.progressSection, { opacity: 0.7 }]}>
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeText}>Origin: IST</Text>
                <Text style={styles.routeText}>Dest: ANK</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '100%', backgroundColor: colors.tertiaryFixedDim }]} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>Delivered On</Text>
                <Text style={styles.footerValueDark}>Oct 21, 2023</Text>
              </View>
              <View style={styles.footerAction}>
                <Text style={styles.footerActionText}>Receipt</Text>
                <MaterialIcons name="receipt-long" size={18} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Exception/Delayed */}
          <TouchableOpacity style={[styles.card, isLargeScreen && styles.cardDesktop]} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.companyLogoBg}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjM3WGmIKGRLjMW6IRU1kYHLqZV247A1R0k-tu002NXpTR9eBvCgJzSinfaCiyYFOL64rFF1bMhhEwZaJJxSkhUQPMWtaYISoFfhJliBKil7ol02FyEnBl2oBWRcxIwHPIpon6aPVYhSD6r7A3WpnmCQ3zsHhjl_muE97mWCTx9X9PyZ7C6jrUdCAkKaLg2jZ5e2XeWi3tgRJVO0bOJzm2jxXY9i2clZORqFEiiPJGldegt9z6hfKr4wZjrwqxlMY8QQev542fsWA' }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.trackingNumber}>DHL987654321</Text>
                  <Text style={styles.companyName}>Prime Courier</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.errorContainer, borderColor: '#ffb4ab' }]}>
                <Text style={[styles.badgeText, { color: colors.onErrorContainer }]}>Action Required</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.warningContainer}>
                <MaterialIcons name="warning" size={16} color={colors.error} />
                <Text style={styles.warningText}>Customs clearance pending</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '40%', backgroundColor: colors.error }]} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>Updated Est. Delivery</Text>
                <Text style={styles.footerValueStrikethrough}>Oct 23, 2023</Text>
                <Text style={styles.footerValueSecondary}>Pending</Text>
              </View>
              <TouchableOpacity style={styles.resolveButton}>
                <Text style={styles.resolveButtonText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        style={[
          styles.fab, 
          { bottom: 24, right: 16 }
        ]} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddPackage')}
      >
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

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
    borderBottomColor: colors.outlineVariant + '40', // 40 hex for roughly 25% opacity
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 30,
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
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    marginBottom: 24,
    gap: 16,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.24,
    color: colors.primary,
  },
  pageTitleLarge: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.64,
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    height: 48,
    maxWidth: 672, // max-w-2xl
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIconLeft: {
    paddingLeft: 12,
  },
  searchIconRight: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurface,
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16, // fallback if flexWrap gap isn't supported smoothly on older RN
  },
  cardDesktop: {
    width: '48%',
    maxWidth: 400,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingRight: 8,
  },
  companyLogoBg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    width: 32,
    height: 32,
  },
  trackingNumber: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: colors.onSurface,
  },
  companyName: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  progressSection: {
    gap: 8,
    marginBottom: 24,
  },
  routeTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.error,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: 16,
    marginTop: 'auto',
  },
  footerLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.outline,
    marginBottom: 2,
  },
  footerValuePrimary: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  footerValueDark: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
  },
  footerValueStrikethrough: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  footerValueSecondary: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.secondary,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    marginRight: -8,
  },
  footerActionText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.primary,
  },
  resolveButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resolveButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSecondary,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
    zIndex: 40,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant + '4D', // 30% opacity
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

export default PackagesScreen;
