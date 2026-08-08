import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { DEFAULT_CARRIERS, isCarrierAllowed } from '../../constants/carriers';
import { CarrierLogo } from './CarrierLogo';
import { useTranslation } from '../../hooks/useTranslation';

interface CarrierSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCarrier?: (carrierName: string) => void;
}

const CARRIERS = DEFAULT_CARRIERS;

export const CarrierSelectionModal = ({
  visible,
  onClose,
  onSelectCarrier,
}: CarrierSelectionModalProps) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 640;
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  const handleCloseWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      translateY.setValue(0);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleCloseWithAnimation();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const filteredCarriers = CARRIERS.filter(
    (carrier) =>
      isCarrierAllowed(carrier.name) &&
      carrier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (carrierName: string) => {
    if (onSelectCarrier) {
      onSelectCarrier(carrierName);
    }
    handleCloseWithAnimation();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCloseWithAnimation}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop Tap to Close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleCloseWithAnimation}
        />

        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              backgroundColor: colors.surfaceContainerLowest,
              paddingBottom: insets.bottom || 24,
              transform: [{ translateY }],
            },
            isLargeScreen && styles.bottomSheetContainerLarge,
          ]}
        >
          {/* Drag Handle Area */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: colors.outlineVariant },
              ]}
            />
          </View>

          {/* Sheet Header */}
          <View
            style={[
              styles.sheetHeader,
              { borderBottomColor: colors.surfaceContainer },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.headerTitleGroup}>
              <MaterialIcons
                name="local-shipping"
                size={22}
                color={colors.primary}
              />
              <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>
                {t('defaultCarriersMenu')}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseWithAnimation}>
              <MaterialIcons
                name="close"
                size={24}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchWrapper,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={colors.outline}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.onSurface }]}
                placeholder={t('searchCarriers')}
                placeholderTextColor={colors.onSurfaceVariant}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons
                    name="cancel"
                    size={18}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              )}
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
                {filteredCarriers.map((carrier) => (
                  <TouchableOpacity
                    key={carrier.id}
                    style={[
                      styles.carrierCard,
                      {
                        backgroundColor: colors.surfaceContainerLowest,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(carrier.name)}
                  >
                    <View
                      style={[
                        styles.carrierIconBg,
                        { backgroundColor: colors.surfaceContainer },
                      ]}
                    >
                      <CarrierLogo logo={carrier.logo} size={36} />
                    </View>
                    <Text
                      style={[styles.carrierName, { color: colors.onSurface }]}
                      numberOfLines={1}
                    >
                      {carrier.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="search-off"
                  size={48}
                  color={colors.outlineVariant}
                />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                  {t('noCarriersFound')}
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t('tryDifferentSearch')}
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    height: 560,
  },
  bottomSheetContainerLarge: {
    maxWidth: 480,
    height: 580,
    borderRadius: 24,
    marginBottom: 24,
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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
    borderRadius: 999,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: 'Inter',
    fontSize: 15,
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
    gap: 12,
  },
  carrierCard: {
    width: '48%',
    aspectRatio: 1.25,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  carrierIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  carrierName: {
    fontFamily: 'Inter',
    fontSize: 13,
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
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 4,
  },
});

export default CarrierSelectionModal;
