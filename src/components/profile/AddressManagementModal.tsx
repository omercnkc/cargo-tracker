import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { AddAddressModal, UserAddress } from './AddAddressModal';
import { ModernFeedbackModal, FeedbackType } from '../common/ModernFeedbackModal';
import { hapticService } from '../../services/haptics.service';
import { useAuthStore } from '../../store/auth.store';
import { USER_ADDRESSES_STORAGE_KEY } from '../../hooks/useUserAddresses';
import { styles } from './AddressManagementModal.styles';

interface AddressManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddressManagementModal({ visible, onClose }: AddressManagementModalProps) {
  const insets = useSafeAreaInsets();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const currentUserName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    primaryBtnText?: string;
    secondaryBtnText?: string;
    onPrimaryAction?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const translateY = useRef(new Animated.Value(0)).current;

  const loadAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      if (stored) {
        const parsed: UserAddress[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map(addr => {
            if (currentUserName && (addr.fullName === 'Ahmet Yılmaz' || addr.fullName === 'Ahmet Yıldız' || !addr.fullName)) {
              return { ...addr, fullName: currentUserName };
            }
            return addr;
          });
          setAddresses(normalized);
          return;
        }
      }
      setAddresses([]);
    } catch (err) {
      console.error('Adresler yüklenemedi:', err);
      setAddresses([]);
    }
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      loadAddresses();
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

  const handleSaveNewAddress = async (newAddress: UserAddress) => {
    const isFirst = addresses.length === 0;
    const addressToSave = { ...newAddress, isDefault: isFirst || newAddress.isDefault };
    const updated = [addressToSave, ...addresses];
    setAddresses(updated);
    await AsyncStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
    hapticService.success();
    setFeedback({
      visible: true,
      type: 'success',
      title: t('success'),
      message: t('addressAddedSuccess'),
      primaryBtnText: t('close'),
      onPrimaryAction: () => setFeedback((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleDeleteAddressPrompt = (item: UserAddress) => {
    hapticService.warning();
    setFeedback({
      visible: true,
      type: 'warning',
      title: t('deleteAddressTitle'),
      message: item.title ? `"${item.title}" - ${t('deleteAddressConfirm')}` : t('deleteAddressConfirm'),
      primaryBtnText: t('delete'),
      secondaryBtnText: t('cancel'),
      onPrimaryAction: async () => {
        const updated = addresses.filter((a) => a.id !== item.id);
        // If deleted address was default and other addresses remain, make the first one default
        if (item.isDefault && updated.length > 0) {
          updated[0].isDefault = true;
        }
        setAddresses(updated);
        await AsyncStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
        hapticService.success();
        setFeedback({
          visible: true,
          type: 'success',
          title: t('success'),
          message: t('addressDeletedSuccess'),
          primaryBtnText: t('close'),
          onPrimaryAction: () => setFeedback((prev) => ({ ...prev, visible: false })),
        });
      },
    });
  };

  const handleSetDefaultAddress = async (id: string) => {
    hapticService.selection();
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    await AsyncStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCloseWithAnimation}>
      <View style={styles.overlay}>
        {/* Backdrop Tap to Close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleCloseWithAnimation}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surfaceContainerLowest,
              paddingBottom: insets.bottom || 24,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle Container */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />
          </View>

          {/* Header */}
          <View style={styles.header} {...panResponder.panHandlers}>
            <View style={styles.titleRow}>
              <MaterialIcons name="location-on" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>{t('myAddresses')}</Text>
            </View>
            <TouchableOpacity onPress={handleCloseWithAnimation} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Add Address Action Button */}
          <TouchableOpacity
            style={[styles.addAddressBtn, { backgroundColor: colors.primary }]}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-location-alt" size={20} color="#ffffff" />
            <Text style={styles.addAddressBtnText}>{t('addNewAddressGps')}</Text>
          </TouchableOpacity>

          {/* Addresses List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={48} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: colors.onSurface }]}>{t('noSavedAddresses')}</Text>
              </View>
            ) : (
              addresses.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.addressCard,
                    {
                      borderColor: item.isDefault ? colors.primary : colors.outlineVariant,
                      backgroundColor: colors.surfaceContainer,
                      borderWidth: item.isDefault ? 1.5 : 1,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleSetDefaultAddress(item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleBadgeRow}>
                      <MaterialIcons
                        name={item.isDefault ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={20}
                        color={item.isDefault ? colors.primary : colors.onSurfaceVariant}
                      />
                      <Text style={[styles.cardTitle, { color: colors.primary }]}>{item.title}</Text>
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>{t('defaultBadge')}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteAddressPrompt(item);
                      }}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.addressBodyText, { color: colors.onSurface }]}>{item.fullAddress}</Text>

                  <View style={styles.cardFooterRow}>
                    <Text style={[styles.contactText, { color: colors.onSurfaceVariant }]}>
                      👤 {item.fullName} | 📞 {item.phone}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>

      {/* GPS Supported Add Address Modal */}
      <AddAddressModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSaveAddress={handleSaveNewAddress}
      />

      {/* Modern Feedback & Delete Confirmation Modal */}
      <ModernFeedbackModal
        visible={feedback.visible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        primaryButtonText={feedback.primaryBtnText || t('confirm')}
        secondaryButtonText={feedback.secondaryBtnText}
        onPrimaryAction={() => {
          if (feedback.onPrimaryAction) {
            feedback.onPrimaryAction();
          } else {
            setFeedback((prev) => ({ ...prev, visible: false }));
          }
        }}
        onSecondaryAction={() => setFeedback((prev) => ({ ...prev, visible: false }))}
        onClose={() => setFeedback((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
}

export default AddressManagementModal;
