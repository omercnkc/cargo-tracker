import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  PanResponder,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { DEFAULT_CARRIERS, isCarrierAllowed } from '../../constants/carriers';
import { CarrierLogo } from './CarrierLogo';
import { useTranslation } from '../../hooks/useTranslation';
import { hapticService } from '../../services/haptics.service';
import { styles } from './CarrierSelectionModal.styles';

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
      translateY.setValue(500);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 240,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleCloseWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onClose();
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
    hapticService.selection();
    if (onSelectCarrier) {
      onSelectCarrier(carrierName);
    }
    handleCloseWithAnimation();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
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

export default CarrierSelectionModal;
