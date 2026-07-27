import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export const PackageDetailScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const isLargeScreen = width >= 768; // md breakpoint

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.appBarTitle}>KargoTakip</Text>
          
          <TouchableOpacity style={[styles.iconButton, { opacity: 0 }]} disabled>
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent, 
          { paddingBottom: insets.bottom + 24 }
        ]}
      >
        {/* Summary Header */}
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.trackingLabel}>TAKİP NUMARASI</Text>
            <Text style={styles.trackingNumber}>TR-849201048</Text>
          </View>
          <View style={styles.statusBadge}>
            <MaterialIcons name="local-shipping" size={18} color={colors.secondary} />
            <Text style={styles.statusBadgeText}>Dağıtımda</Text>
          </View>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_X65X_0Z7qD_s4nMcvGVOmmypg_x5GAUTUSfexI2rfOJOB1rBp64UHrtL9lRyQoLfs0XuH6bJMk0OSsV_31wiv0B2lOROtDu2V_nSW2ccuk_iZqozOyueKutuCNxDYnLxpXKzKlYSeutWQjAY4mx1BUK1MirTkqG1sPFuLCuli1P0vMYXpLKOCspvPhlizqkNTmR_XOeaVTmOCtofO18yopONDpxNjaOlGz8IhIQc9kQ4tN2_RKTkpgAmYrWYZbZzagW6iJxGQEg' }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.mapOverlay}>
            <View style={styles.mapIconBg}>
              <MaterialIcons name="location-on" size={20} color={colors.onPrimaryContainer} />
            </View>
            <View>
              <Text style={styles.mapOverlayLabel}>Son Konum</Text>
              <Text style={styles.mapOverlayValue}>Levent Dağıtım Merkezi, İstanbul</Text>
            </View>
          </View>
        </View>

        {/* Bento Grid for Details & Timeline */}
        <View style={[styles.gridContainer, isLargeScreen && styles.gridContainerDesktop]}>
          
          {/* Details Section (Left Col on Desktop) */}
          <View style={[styles.detailsSection, isLargeScreen && styles.detailsColDesktop]}>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="info" size={24} color={colors.primary} />
                <Text style={styles.cardTitle}>Teslimat Bilgileri</Text>
              </View>
              
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>TAHMİNİ TESLİMAT</Text>
                <Text style={styles.infoValuePrimary}>Bugün, 14:00 - 18:00</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>GÖNDERİCİ</Text>
                <Text style={styles.infoValue}>TechStore Elektronik A.Ş.</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>ALICI ADRESİ</Text>
                <Text style={styles.infoValueSmall}>
                  Barbaros Bulvarı No:145, Daire:12{'\n'}
                  Beşiktaş, İstanbul{'\n'}
                  34349
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.infoLabel}>KURYE BİLGİSİ</Text>
              <View style={styles.courierRow}>
                <View style={styles.courierAvatar}>
                  <MaterialIcons name="person" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.courierName}>Ahmet Y.</Text>
                  <Text style={styles.courierPlate}>34 ABC 123</Text>
                </View>
              </View>
            </View>

          </View>

          {/* Vertical Timeline (Right Col on Desktop) */}
          <View style={[styles.card, styles.timelineCard, isLargeScreen && styles.timelineColDesktop]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="history" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Gönderi Hareketleri</Text>
            </View>

            <View style={styles.timelineContainer}>
              {/* Vertical Lines */}
              <View style={styles.timelineLineBg} />
              <View style={styles.timelineLineFill} />

              {/* Step 4 (Current) */}
              <View style={styles.timelineStep}>
                <View style={styles.timelineDotActiveWrapper}>
                  <View style={styles.timelineDotActiveInner} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitleActive}>Dağıtıma Çıkarıldı</Text>
                  <Text style={styles.timelineDescription}>Kurye teslimat adresine doğru yola çıktı.</Text>
                  <Text style={styles.timelineTime}>Bugün, 09:15</Text>
                </View>
              </View>

              {/* Step 3 */}
              <View style={styles.timelineStep}>
                <View style={styles.timelineDotCompleted}>
                  <MaterialIcons name="check" size={12} color={colors.onTertiary} />
                </View>
                <View style={[styles.timelineContent, { opacity: 0.7 }]}>
                  <Text style={styles.timelineTitle}>Transfer Merkezinde</Text>
                  <Text style={styles.timelineDescription}>Avrupa Yakası Aktarma Merkezi - İstanbul</Text>
                  <Text style={styles.timelineTime}>Dün, 22:45</Text>
                </View>
              </View>

              {/* Step 2 */}
              <View style={styles.timelineStep}>
                <View style={styles.timelineDotCompleted}>
                  <MaterialIcons name="check" size={12} color={colors.onTertiary} />
                </View>
                <View style={[styles.timelineContent, { opacity: 0.7 }]}>
                  <Text style={styles.timelineTitle}>Yola Çıktı</Text>
                  <Text style={styles.timelineDescription}>Çıkış Şubesi - Ankara</Text>
                  <Text style={styles.timelineTime}>Dün, 18:30</Text>
                </View>
              </View>

              {/* Step 1 */}
              <View style={styles.timelineStep}>
                <View style={styles.timelineDotCompleted}>
                  <MaterialIcons name="check" size={12} color={colors.onTertiary} />
                </View>
                <View style={[styles.timelineContent, { opacity: 0.7 }]}>
                  <Text style={styles.timelineTitle}>Sipariş Alındı</Text>
                  <Text style={styles.timelineDescription}>Gönderici kargoyu şubeye teslim etti.</Text>
                  <Text style={styles.timelineTime}>Dün, 14:10</Text>
                </View>
              </View>

            </View>
          </View>
          
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
    borderBottomColor: colors.outlineVariant + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 50,
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
    paddingTop: 24,
    maxWidth: 896, // max-w-4xl
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trackingLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
  },
  trackingNumber: {
    fontFamily: 'Courier Prime',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondaryFixed,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.onSecondaryFixedVariant,
  },
  mapContainer: {
    height: 256,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: colors.surfaceContainerLowest,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  mapIconBg: {
    backgroundColor: colors.primaryContainer,
    padding: 8,
    borderRadius: 999,
  },
  mapOverlayLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
  },
  mapOverlayValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onBackground,
  },
  gridContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  gridContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailsSection: {
    flexDirection: 'column',
    gap: 24,
  },
  detailsColDesktop: {
    flex: 1,
  },
  timelineColDesktop: {
    flex: 2,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  infoGroup: {
    marginVertical: 4,
  },
  infoLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  infoValuePrimary: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onBackground,
  },
  infoValue: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onBackground,
  },
  infoValueSmall: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onBackground,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: 12,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onBackground,
  },
  courierPlate: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  timelineContainer: {
    paddingLeft: 24,
    position: 'relative',
    marginTop: 8,
  },
  timelineLineBg: {
    position: 'absolute',
    left: 11,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: colors.surfaceContainerHigh,
    zIndex: 0,
  },
  timelineLineFill: {
    position: 'absolute',
    left: 11,
    top: 8,
    height: '50%', // Assuming it represents current progress
    width: 2,
    backgroundColor: colors.tertiaryContainer,
    zIndex: 0,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 32,
    zIndex: 10,
  },
  timelineDotActiveWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    marginLeft: -11,
    marginTop: 2,
  },
  timelineDotActiveInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  timelineDotCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    marginLeft: -11,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitleActive: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: colors.onBackground,
  },
  timelineTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onBackground,
  },
  timelineDescription: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  timelineTime: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: colors.outline,
    marginTop: 4,
  },
});

export default PackageDetailScreen;
