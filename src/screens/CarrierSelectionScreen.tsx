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
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { DEFAULT_CARRIERS, isCarrierAllowed } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { useTranslation } from '../hooks/useTranslation';

const CARRIERS = DEFAULT_CARRIERS;

export const CarrierSelectionScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 640;
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [sheetVisible, setSheetVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCarriers = CARRIERS.filter(
    (carrier) =>
      isCarrierAllowed(carrier.name) &&
      carrier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('carriersTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={[styles.mockMainContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.mockTitle, { color: colors.onSurface }]}>{t('selectCarrier')}</Text>
        <Text style={[styles.mockSubtitle, { color: colors.onSurfaceVariant }]}>{t('selectCarrierSubtitle')}</Text>
        <TouchableOpacity
          style={[styles.openButton, { backgroundColor: colors.primary }]}
          onPress={() => setSheetVisible(true)}
        >
          <Text style={[styles.openButtonText, { color: colors.onPrimary }]}>{t('selectCarrier')}</Text>
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
            { backgroundColor: colors.surfaceContainerLowest, paddingBottom: insets.bottom || 24 },
            isLargeScreen && styles.bottomSheetContainerLarge
          ]}>

            {/* Drag Handle (Mobile) */}
            {!isLargeScreen && (
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />
              </View>
            )}

            {/* Sheet Header */}
            <View style={[styles.sheetHeader, { borderBottomColor: colors.surfaceContainer }]}>
              <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>{t('selectCarrier')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSheetVisible(false)}
              >
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchWrapper, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.onSurface }]}
                  placeholder={t('searchCarriers')}
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Carrier Grid */}
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
                      style={[styles.carrierCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.carrierIconBg, { backgroundColor: colors.surfaceContainer }]}>
                        <CarrierLogo
                          logo={carrier.logo}
                          size={36}
                        />
                      </View>
                      <Text style={[styles.carrierName, { color: colors.onSurface }]}>{carrier.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="search-off" size={48} color={colors.outlineVariant} />
                  <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>{t('noCarriersFound')}</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>{t('tryDifferentSearch')}</Text>
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
  },
  appBar: {
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
    marginBottom: 8,
  },
  mockSubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  openButton: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomSheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    maxHeight: '90%',
    height: 640,
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
    borderRadius: 999,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
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
    borderWidth: 1,
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
    width: '47%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  carrierIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 4,
  },
});

export default CarrierSelectionScreen;
