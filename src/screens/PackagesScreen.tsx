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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import useResponsive from '../hooks/useResponsive';

export const PackagesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const { theme: colors } = useTheme();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>
      {/* TopAppBar */}
      <View style={[{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.outlineVariant + '40',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 30,
        paddingTop: insets.top,
      }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="menu" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>KargoTakip</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AddPackage')}>
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent, 
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
        ]}
      >
        {/* Header & Search Area */}
        <View style={styles.headerSection}>
          <Text style={[isLargeScreen ? styles.pageTitleLarge : styles.pageTitle, { color: colors.primary }]}>
            Aktif Kargolar
          </Text>
          
          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIconLeft} />
            <TextInput 
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder="Takip no veya firma ara..."
              placeholderTextColor={colors.onSurfaceVariant}
            />
            <TouchableOpacity style={styles.searchIconRight}>
              <MaterialIcons name="filter-list" size={20} color={colors.outline} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Package List */}
        <View style={styles.packageGrid}>
          
          {/* Card 1: In Transit */}
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.cardDesktop]} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.companyLogoBg, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQAYJqGOz9kirXFakdn6xML_KFwHoJ2AJzf-LABWag5ontXgnBPLXxI192uHGnjtuk1Hxtu-RPvkgWi0FBe9hxBGpkREvyF-yGAGETdnOiW_Anjj5uxVbdY_4bphH45OozbEFmwKUcPL_IUaiv_kQ9ytX8zYZN6Rjyf-niXHs8wnoifbWzkzkiNk9XR2LgbV4Wi156KAbDz5St-Hj_eU3BHdztDN5j4hzSUGx41fUlqY5txG6DkkVfv-TWr8LO_vNfc0oDWmNgiDY' }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={[styles.trackingNumber, { color: colors.onSurface }]}>KP8943271105</Text>
                  <Text style={[styles.companyName, { color: colors.onSurfaceVariant }]}>Global Express</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.secondaryContainer, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.badgeText, { color: colors.onSurface }]}>Yolda</Text>
              </View>
            </View>

            <View style={[styles.progressSection]}>
              <View style={styles.routeTextContainer}>
                <Text style={[styles.routeText, { color: colors.onSurfaceVariant }]}>Kaynak: SHZ</Text>
                <Text style={[styles.routeText, { color: colors.onSurfaceVariant }]}>Hedef: BER</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainer }]}>
                <View style={[styles.progressBarFill, { width: '65%', backgroundColor: colors.primary }]} />
              </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.outlineVariant }]}>
              <View>
                <Text style={[styles.footerLabel, { color: colors.outline }]}>Tahmini Teslimat</Text>
                <Text style={[styles.footerValuePrimary, { color: colors.primary }]}>Eki 24, 2023</Text>
              </View>
              <View style={styles.footerAction}>
                <Text style={[styles.footerActionText, { color: colors.primary }]}>Detaylar</Text>
                <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Delivered */}
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.cardDesktop]} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.companyLogoBg, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDndS9Xc59oX3WY735_crAmXQ57-GM1fOr2dpm7X82EOQi_wrJYw-pezBidOWHCa5k2Jy1QwtHqXyIABwy5DXMNneud1hVTvgLgVAXu0tIpyFM5yXixn4oLdsd9Tx8vvrITOEE58KWT8S-4-o6DUn-AZC0lkllVys5M0fxjZ5uZ5Ua6NrZA9PNoMvaOzlJcX2YxYivdZlnA8-We-T7hLcjvmmqA9xl7THZHNToHPMHiUGTg-sN5OTNsTIi5wCXOW9ahAtLQ_qb-4rk' }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={[styles.trackingNumber, { color: colors.onSurface }]}>TR1029384756</Text>
                  <Text style={[styles.companyName, { color: colors.onSurfaceVariant }]}>National Post</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.tertiaryContainer, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.badgeText, { color: colors.onTertiaryContainer }]}>Teslim Edildi</Text>
              </View>
            </View>

            <View style={[styles.progressSection, { opacity: 0.7 }]}>
              <View style={styles.routeTextContainer}>
                <Text style={[styles.routeText, { color: colors.onSurfaceVariant }]}>Kaynak: IST</Text>
                <Text style={[styles.routeText, { color: colors.onSurfaceVariant }]}>Hedef: ANK</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainer }]}>
                <View style={[styles.progressBarFill, { width: '100%', backgroundColor: colors.tertiary }]} />
              </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.outlineVariant }]}>
              <View>
                <Text style={[styles.footerLabel, { color: colors.outline }]}>Teslim Tarihi</Text>
                <Text style={[styles.footerValuePrimary, { color: colors.onSurface }]}>Eki 21, 2023</Text>
              </View>
              <View style={styles.footerAction}>
                <Text style={[styles.footerActionText, { color: colors.primary }]}>Makbuz</Text>
                <MaterialIcons name="receipt-long" size={18} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Action Required */}
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }, isLargeScreen && styles.cardDesktop]} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.companyLogoBg, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjM3WGmIKGRLjMW6IRU1kYHLqZV247A1R0k-tu002NXpTR9eBvCgJzSinfaCiyYFOL64rFF1bMhhEwZaJJxSkhUQPMWtaYISoFfhJliBKil7ol02FyEnBl2oBWRcxIwHPIpon6aPVYhSD6r7A3WpnmCQ3zsHhjl_muE97mWCTx9X9PyZ7C6jrUdCAkKaLg2jZ5e2XeWi3tgRJVO0bOJzm2jxXY9i2clZORqFEiiPJGldegt9z6hfKr4wZjrwqxlMY8QQev542fsWA' }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={[styles.trackingNumber, { color: colors.onSurface }]}>DHL987654321</Text>
                  <Text style={[styles.companyName, { color: colors.onSurfaceVariant }]}>Prime Courier</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.errorContainer, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.badgeText, { color: colors.onErrorContainer }]}>İşlem Gerekli</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.routeTextContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialIcons name="warning" size={16} color={colors.error} />
                  <Text style={[styles.routeText, { color: colors.error }]}>Gümrük onayı bekleniyor</Text>
                </View>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainer }]}>
                <View style={[styles.progressBarFill, { width: '40%', backgroundColor: colors.error }]} />
              </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.outlineVariant }]}>
              <View>
                <Text style={[styles.footerLabel, { color: colors.outline }]}>Güncellenen Teslimat</Text>
                <Text style={[{ fontSize: 16, fontWeight: '600', color: colors.onSurface, textDecorationLine: 'line-through', opacity: 0.5 }]}>Eki 23, 2023</Text>
                <Text style={[{ fontSize: 16, fontWeight: '600', color: colors.secondary }]}>Beklemede</Text>
              </View>
              <TouchableOpacity style={[styles.resolveButton, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.resolveButtonText, { color: colors.onSecondary }]}>Çöz</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 80, right: 16 }]} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddPackage')}
      >
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  pageTitleLarge: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    maxWidth: 672,
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
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    width: 32,
    height: 32,
  },
  trackingNumber: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
  },
  companyName: {
    fontFamily: 'Inter',
    fontSize: 14,
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
  },
  progressBarBg: {
    height: 8,
    width: '100%',
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
    paddingTop: 16,
  },
  footerLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    marginBottom: 2,
  },
  footerValuePrimary: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
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
  },
  resolveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resolveButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
    zIndex: 40,
  },
});

export default PackagesScreen;
