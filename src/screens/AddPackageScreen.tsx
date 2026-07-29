import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Image,
  Modal,
  FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCourierCompanies, useAddShipment } from '../features/shipment/hooks/useShipments';
import { useAuthStore } from '../store/auth.store';
import { Alert, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';

const FALLBACK_CARRIERS = [
  { id: '1', name: 'Aras Kargo', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUixqteUkvVuCtTekD11ZPAYGfotm_0-u2d6PkWmTDbDsIy359BoMk_iaPb0dAuFIh76cxt7kOuh12kLFi0RsP6O9bKbRbKf_ZGzsymDu25kr9yQscZ-QysYc5X3rMpzBVQGPbcsfcN4r7oKpyzRS6y7FY-bJ-05KXIdZS75nVXD2JdUAsu2nDlOwLKxwlKeTWh9f7MnVYRp8REThNF7W1zBhAVkuC3laz3iYowXMXNZ9tJU1EipWmjpYhrQDSk6hB-c5WRxZapMU' },
  { id: '2', name: 'Yurtiçi Kargo', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuMcqEYYXnINPebCw47LFOwDAEMkaPK0wkeZYhHC-Y1LRo27vSXiwsZj-2POLuiDyVEddgFZANr12CozIOIyEof2JvxXsB1DjK2vioCTunxDqoJr4nzFx8w_-szhNS3pk3KzoXMbqeK2TFgx6r6y7Ff4PO8TWhLneY3AWgC_3KS8I__emL-zS8NOEYR3iqGhnPt8GcmFOMjETNhMD9anaVguTp1-0aROE6WKzmTrPlyoovRqgAh9kPS_J0s0kf5V7N-LOzaJW8xRs' },
  { id: '3', name: 'DHL', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUZ-lbClVqkQAs-jbH9GKAu2C--Tt6IDgUGuGzYqpJgQCD2DiqGC-lp9ogphgApc1YNvrG5YVArJ3RucNPTLwCeIP2utImaocVA-VSGY2YFO-RommS_Fo6Chpnqzgi4Prgq9g-troPi1QTZV-ZZ7x0uN50EU748KUYmP6qYoTxQsZzCas8cZv2iGFDmYSHb-07iV2CHqu-JnU3aA3vuDxeQzMzB9ysqpz4268fSkd1plkGDY6G81BOxLOwl7zHoZzNnEzm-PEUxNE' },
  { id: '4', name: 'UPS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzUc84pU9JioEWNY7eyGzLE7yMPU0RGWibx-pqU-f2gCePtRnXVDmNMdYMzsdRAreTC77UdAHXRCpnDAWgPmryLHMUhNpGemmuLE2HQb4Jtbm2B2vZfFztmZDnrubiSUb--R3VSzo-n8JjPE71IE0e1if2tK4YpS5S2zlVVJ5gp6HZnsqXITZjzEKEM7tRSHYEIEUZg1Axji3N7OcihvkVD3zwkakuak-vD_qUDDBb7Jca6S4XzIzdcTn9DNbNyKRyMo4H8at_cyQ' },
  { id: '5', name: 'MNG Kargo', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlVM6o4wKY4rCi1HKWhgfHSTuHuA1-ePAVsyz5wg8h94CAaW86Nt_x6YrP1U53DvsvkfP5SsrHeqnJk-5N7XjFDro4km2WKG-fihkk0ky71Px_wCJ1ViEL3Js2KBmieU-xmfIJ36BC21R7WtvbzjNnuui8JqVOGAuxjVHUJpLG4Cf4Rjb8_2Uzzl-WZFxk-3bfRD9QEjVrbVzrHhAuXE29hsesRrgEg1WPiqUScM2Ng_dQyNkiuSeRt1bkpZszloz31LSqBHNzRhI' },
  { id: '6', name: 'PTT Kargo', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB1zSf7kxmY8C_5-etb0sfPsXQb5pwjtQED4ORcd9zL4fLFvWwBk5o-ZtMFKOWLnnuBL9d5u8r13hSJhClaZ0mSFpTQ59Gq70-Jiq9upSGmh5UYZShhSyJNk_DXxw_r6Om53_2I4sVreetCk3gbt3c1k6GAjVHZsSqwkBO028upnqYqIEEqeID6wXrURWDd1sUmpLL1grFDo3ckXKY3W_u3DCM1YCRLT-ZDAE_5g__b1r0HK1tEJgiAzZ-xGV1djAzx--hzv74yPo' },
];

export const AddPackageScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const user = useAuthStore(state => state.user);

  const { data: dbCouriers } = useCourierCompanies();
  const addShipmentMutation = useAddShipment();

  const carriers = (dbCouriers && dbCouriers.length > 0)
    ? dbCouriers.map(c => ({ id: c.id, name: c.name, logo: c.logo_url || '' }))
    : FALLBACK_CARRIERS;

  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (route.params?.scannedTrackingNumber) {
      setTrackingNumber(route.params.scannedTrackingNumber);
    }
  }, [route.params?.scannedTrackingNumber]);
  
  const [sheetVisible, setSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCarriers = carriers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeCarrier = carriers.find(c => c.id === selectedCarrier);

  const handleSubmit = async () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Hata', 'Lütfen bir takip numarası girin.');
      return;
    }

    if (!user) {
      Alert.alert('Hata', 'Oturum bulunamadı.');
      return;
    }

    try {
      await addShipmentMutation.mutateAsync({
        user_id: user.id,
        tracking_number: trackingNumber.trim(),
        company_id: selectedCarrier && selectedCarrier.length > 5 ? selectedCarrier : null,
        title: nickname.trim() || null,
        current_status: 'transit',
      });

      Alert.alert('Başarılı', 'Kargo başarıyla eklendi!', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Kargo eklenirken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header - Adaptive for Mobile/Desktop */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={[styles.headerContent, isLargeScreen && styles.headerContentDesktop]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
              {isLargeScreen && (
                <Text style={styles.headerBrandText}>KargoTakip</Text>
              )}
            </View>
            
            <Text style={styles.headerTitle}>
              {isLargeScreen ? 'Add New Package' : 'Add Package'}
            </Text>
            
            <View style={styles.headerRightSpacer} />
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom + 24 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {/* Main Card */}
          <View style={styles.card}>
            
            {/* Decorative element (approximated for RN) */}
            <View style={styles.decorativeBlur} />

            <View style={styles.cardHeader}>
              <Text style={styles.title}>Track a New Shipment</Text>
              <Text style={styles.subtitle}>Enter the details below to start tracking your cargo.</Text>
            </View>

            <View style={styles.form}>
              
              {/* Tracking Number Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Tracking Number <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="tag" size={20} color={colors.outline} />
                  </View>
                  <TextInput
                    style={styles.inputMono}
                    placeholder="e.g. 1Z9999999999999999"
                    placeholderTextColor={colors.outlineVariant}
                    value={trackingNumber}
                    onChangeText={setTrackingNumber}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    style={styles.qrButton}
                    onPress={() => navigation.navigate('Scanner')}
                  >
                    <MaterialIcons name="qr-code-scanner" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Carrier Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Carrier <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.carrierSelectorBtn} 
                  onPress={() => setSheetVisible(true)}
                  activeOpacity={0.8}
                >
                  {activeCarrier ? (
                    <View style={styles.carrierSelectorContent}>
                      <Image source={{ uri: activeCarrier.logo }} style={styles.carrierSelectorLogo} />
                      <Text style={styles.carrierSelectorText}>{activeCarrier.name}</Text>
                    </View>
                  ) : (
                    <Text style={styles.carrierSelectorPlaceholder}>Select Carrier...</Text>
                  )}
                  <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
                </TouchableOpacity>
              </View>

              {/* Package Nickname */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Package Nickname</Text>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="inventory" size={20} color={colors.outline} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. New Shoes"
                    placeholderTextColor={colors.outlineVariant}
                    value={nickname}
                    onChangeText={setNickname}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <View style={styles.submitContainer}>
                <TouchableOpacity 
                  style={styles.submitButton} 
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={addShipmentMutation.isPending}
                >
                  {addShipmentMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <>
                      <MaterialIcons name="add-box" size={20} color={colors.onPrimary} />
                      <Text style={styles.submitButtonText}>Save Package</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Sheet Modal for Carrier Selection */}
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

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Carrier</Text>
              <TouchableOpacity style={styles.iconButton} onPress={() => setSheetVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchIconContainer}>
                <MaterialIcons name="search" size={20} color={colors.outline} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search carriers..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.sheetScroll}>
              {filteredCarriers.length > 0 ? (
                <FlatList
                  data={filteredCarriers}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 24, gap: 16 }}
                  columnWrapperStyle={{ gap: 16, justifyContent: 'space-between' }}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.carrierGridCard}
                      onPress={() => {
                        setSelectedCarrier(item.id);
                        setSheetVisible(false);
                        setSearchQuery('');
                      }}
                    >
                      <View style={styles.carrierGridIconBox}>
                        <Image source={{ uri: item.logo }} style={styles.carrierGridLogo} />
                      </View>
                      <Text style={styles.carrierGridName}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <MaterialIcons name="search-off" size={32} color={colors.outlineVariant} />
                  <Text style={styles.noResultsText}>No carriers found</Text>
                  <Text style={styles.noResultsSubtext}>Try searching for a different name.</Text>
                </View>
              )}
            </View>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 40,
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerContentDesktop: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  headerBrandText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  headerRightSpacer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16, // margin-mobile
    paddingTop: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 768, // max-w-3xl
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // glass-card approximation
    borderRadius: 12,
    padding: 24, // container-padding
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  decorativeBlur: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: colors.primaryFixed,
    opacity: 0.4,
    // Add simple blur effect approximation for native
    shadowColor: colors.primaryFixed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 20,
    zIndex: 0,
  },
  cardHeader: {
    marginBottom: 32,
    gap: 8,
    zIndex: 10,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 24, // headline-lg-mobile
    fontWeight: '700',
    letterSpacing: -0.24,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: 24,
    zIndex: 10,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurface,
  },
  requiredAsterisk: {
    color: colors.error,
  },
  optionalText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    color: colors.outline,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    color: colors.onSurface,
    height: 52,
    paddingLeft: 40,
    paddingRight: 16,
  },
  inputMono: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    color: colors.onSurface,
    height: 52,
    paddingLeft: 40,
    paddingRight: 48,
  },
  qrButton: {
    position: 'absolute',
    right: 8,
    zIndex: 10,
    padding: 8,
    borderRadius: 999,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  chipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: colors.onPrimaryContainer,
  },
  submitContainer: {
    paddingTop: 16,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 56,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  carrierSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  carrierSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carrierSelectorLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  carrierSelectorText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '600',
  },
  carrierSelectorPlaceholder: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
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
    height: 600,
  },
  bottomSheetContainerLarge: {
    maxWidth: 448,
    height: 600,
    borderRadius: 24,
    marginBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: 'relative',
  },
  searchIconContainer: {
    position: 'absolute',
    left: 36,
    top: 30,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurface,
  },
  sheetScroll: {
    flex: 1,
  },
  carrierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
    justifyContent: 'space-between',
  },
  carrierGridCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  carrierGridIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  carrierGridLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  carrierGridName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurface,
    marginTop: 12,
  },
  noResultsSubtext: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  }
});

export default AddPackageScreen;
