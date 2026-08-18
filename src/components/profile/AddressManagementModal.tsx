import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { AddAddressModal, UserAddress } from './AddAddressModal';
import { ModernFeedbackModal, FeedbackType } from '../common/ModernFeedbackModal';
import { hapticService } from '../../services/haptics.service';

const ADDRESSES_STORAGE_KEY = '@cargo_tracker_user_addresses';

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 'addr_default_1',
    title: 'Ev Adresim',
    fullName: 'Ahmet Yılmaz',
    phone: '0555 123 45 67',
    city: 'İstanbul',
    district: 'Beşiktaş',
    fullAddress: 'Cihannüma Mah. Barbaros Bulvarı No:42 D:5, Beşiktaş / İstanbul',
    isDefault: true,
  },
  {
    id: 'addr_default_2',
    title: 'İş Yeri (Ofis)',
    fullName: 'Ahmet Yılmaz',
    phone: '0555 987 65 43',
    city: 'İstanbul',
    district: 'Levent',
    fullAddress: 'Büyükdere Cad. No:199 K:12, Levent / İstanbul',
  },
];

interface AddressManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddressManagementModal({ visible, onClose }: AddressManagementModalProps) {
  const insets = useSafeAreaInsets();
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [addresses, setAddresses] = useState<UserAddress[]>(DEFAULT_ADDRESSES);
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

  const loadAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Adresler yüklenemedi:', err);
    }
  };

  const handleSaveNewAddress = async (newAddress: UserAddress) => {
    const updated = [newAddress, ...addresses];
    setAddresses(updated);
    await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
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
        setAddresses(updated);
        await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
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
                <View key={item.id} style={[styles.addressCard, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainer }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleBadgeRow}>
                      <Text style={[styles.cardTitle, { color: colors.primary }]}>{item.title}</Text>
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>{t('defaultBadge')}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteAddressPrompt(item)} style={styles.deleteBtn}>
                      <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.addressBodyText, { color: colors.onSurface }]}>{item.fullAddress}</Text>

                  <View style={styles.cardFooterRow}>
                    <Text style={[styles.contactText, { color: colors.onSurfaceVariant }]}>
                      👤 {item.fullName} | 📞 {item.phone}
                    </Text>
                  </View>
                </View>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '85%',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  addAddressBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#1e40af',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  addressBodyText: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
  cardFooterRow: {
    marginTop: 6,
  },
  contactText: {
    fontSize: 12,
  },
});
