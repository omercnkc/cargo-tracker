import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const CARRIERS = [
  {
    id: '1',
    name: 'Aras Kargo',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUixqteUkvVuCtTekD11ZPAYGfotm_0-u2d6PkWmTDbDsIy359BoMk_iaPb0dAuFIh76cxt7kOuh12kLFi0RsP6O9bKbRbKf_ZGzsymDu25kr9yQscZ-QysYc5X3rMpzBVQGPbcsfcN4r7oKpyzRS6y7FY-bJ-05KXIdZS75nVXD2JdUAsu2nDlOwLKxwlKeTWh9f7MnVYRp8REThNF7W1zBhAVkuC3laz3iYowXMXNZ9tJU1EipWmjpYhrQDSk6hB-c5WRxZapMU'
  },
  {
    id: '2',
    name: 'Yurtiçi Kargo',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuMcqEYYXnINPebCw47LFOwDAEMkaPK0wkeZYhHC-Y1LRo27vSXiwsZj-2POLuiDyVEddgFZANr12CozIOIyEof2JvxXsB1DjK2vioCTunxDqoJr4nzFx8w_-szhNS3pk3KzoXMbqeK2TFgx6r6y7Ff4PO8TWhLneY3AWgC_3KS8I__emL-zS8NOEYR3iqGhnPt8GcmFOMjETNhMD9anaVguTp1-0aROE6WKzmTrPlyoovRqgAh9kPS_J0s0kf5V7N-LOzaJW8xRs'
  },
  {
    id: '3',
    name: 'DHL',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUZ-lbClVqkQAs-jbH9GKAu2C--Tt6IDgUGuGzYqpJgQCD2DiqGC-lp9ogphgApc1YNvrG5YVArJ3RucNPTLwCeIP2utImaocVA-VSGY2YFO-RommS_Fo6Chpnqzgi4Prgq9g-troPi1QTZV-ZZ7x0uN50EU748KUYmP6qYoTxQsZzCas8cZv2iGFDmYSHb-07iV2CHqu-JnU3aA3vuDxeQzMzB9ysqpz4268fSkd1plkGDY6G81BOxLOwl7zHoZzNnEzm-PEUxNE'
  },
  {
    id: '4',
    name: 'UPS',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzUc84pU9JioEWNY7eyGzLE7yMPU0RGWibx-pqU-f2gCePtRnXVDmNMdYMzsdRAreTC77UdAHXRCpnDAWgPmryLHMUhNpGemmuLE2HQb4Jtbm2B2vZfFztmZDnrubiSUb--R3VSzo-n8JjPE71IE0e1if2tK4YpS5S2zlVVJ5gp6HZnsqXITZjzEKEM7tRSHYEIEUZg1Axji3N7OcihvkVD3zwkakuak-vD_qUDDBb7Jca6S4XzIzdcTn9DNbNyKRyMo4H8at_cyQ'
  },
  {
    id: '5',
    name: 'MNG Kargo',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlVM6o4wKY4rCi1HKWhgfHSTuHuA1-ePAVsyz5wg8h94CAaW86Nt_x6YrP1U53DvsvkfP5SsrHeqnJk-5N7XjFDro4km2WKG-fihkk0ky71Px_wCJ1ViEL3Js2KBmieU-xmfIJ36BC21R7WtvbzjNnuui8JqVOGAuxjVHUJpLG4Cf4Rjb8_2Uzzl-WZFxk-3bfRD9QEjVrbVzrHhAuXE29hsesRrgEg1WPiqUScM2Ng_dQyNkiuSeRt1bkpZszloz31LSqBHNzRhI'
  },
  {
    id: '6',
    name: 'PTT Kargo',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB1zSf7kxmY8C_5-etb0sfPsXQb5pwjtQED4ORcd9zL4fLFvWwBk5o-ZtMFKOWLnnuBL9d5u8r13hSJhClaZ0mSFpTQ59Gq70-Jiq9upSGmh5UYZShhSyJNk_DXxw_r6Om53_2I4sVreetCk3gbt3c1k6GAjVHZsSqwkBO028upnqYqIEEqeID6wXrURWDd1sUmpLL1grFDo3ckXKY3W_u3DCM1YCRLT-ZDAE_5g__b1r0HK1tEJgiAzZ-xGV1djAzx--hzv74yPo'
  }
];

export const CarrierSelectionScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 640; // sm breakpoint in mockup

  const [sheetVisible, setSheetVisible] = useState(true); // Open by default for demo
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCarriers = CARRIERS.filter(carrier => 
    carrier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* Background Main Context (Mock) */}
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

      <View style={styles.mockMainContent}>
        <Text style={styles.mockTitle}>Track a Package</Text>
        <Text style={styles.mockSubtitle}>Select a carrier to begin tracking your shipment.</Text>
        <TouchableOpacity 
          style={styles.openButton}
          onPress={() => setSheetVisible(true)}
        >
          <Text style={styles.openButtonText}>Select Carrier</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={sheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setSheetVisible(false)}
          />

          <View style={[
            styles.bottomSheetContainer, 
            { paddingBottom: insets.bottom || 24 },
            isLargeScreen && styles.bottomSheetContainerLarge
          ]}>
            
            {/* Drag Handle (Mobile) */}
            {!isLargeScreen && (
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>
            )}

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Carrier</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSheetVisible(false)}
              >
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchWrapper}>
                <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search carriers..."
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Carrier Grid / Empty State */}
            <ScrollView 
              style={styles.gridScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContentContainer}
            >
              {filteredCarriers.length > 0 ? (
                <View style={styles.grid}>
                  {filteredCarriers.map(carrier => (
                    <TouchableOpacity 
                      key={carrier.id} 
                      style={styles.carrierCard}
                      activeOpacity={0.7}
                    >
                      <View style={styles.carrierIconBg}>
                        <Image 
                          source={{ uri: carrier.logo }}
                          style={styles.carrierLogo}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.carrierName}>{carrier.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="search-off" size={48} color={colors.outlineVariant} />
                  <Text style={styles.emptyTitle}>No carriers found</Text>
                  <Text style={styles.emptySubtitle}>Try searching for a different name.</Text>
                </View>
              )}
            </ScrollView>

          </View>
        </KeyboardAvoidingView>
      </Modal>

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
    zIndex: 10,
  },
  appBarContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  mockMainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mockTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 8,
  },
  mockSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
    textAlign: 'center',
  },
  openButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)', // bg-on-background/40
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomSheetContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    maxHeight: '90%',
    height: 751, // From mockup mobile
  },
  bottomSheetContainerLarge: {
    maxWidth: 448, // max-w-md
    height: 600,
    borderRadius: 24,
    marginBottom: 16, // Float it slightly on desktop
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.outlineVariant,
    borderRadius: 999,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
  },
  closeButton: {
    padding: 8,
    borderRadius: 999,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurface,
  },
  gridScroll: {
    flex: 1,
  },
  gridContentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  carrierCard: {
    width: '47%', // approx grid-cols-2 with gap
    aspectRatio: 1, // aspect-square
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  carrierIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  carrierLogo: {
    width: 40,
    height: 40,
  },
  carrierName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurface,
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
});

export default CarrierSelectionScreen;
