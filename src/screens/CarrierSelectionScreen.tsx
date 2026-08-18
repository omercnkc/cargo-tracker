import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { DEFAULT_CARRIERS, isCarrierAllowed } from '../constants/carriers';
import { CarrierLogo } from '../components/common/CarrierLogo';
import { useTranslation } from '../hooks/useTranslation';
import { styles } from './CarrierSelectionScreen.styles';

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

export default CarrierSelectionScreen;
