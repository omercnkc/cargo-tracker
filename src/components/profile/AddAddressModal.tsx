import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

export interface UserAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
  isDefault?: boolean;
}

interface AddAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveAddress: (address: UserAddress) => void;
}

export function AddAddressModal({ visible, onClose, onSaveAddress }: AddAddressModalProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; fullAddress?: string }>({});

  const handleFetchCurrentGpsLocation = async () => {
    try {
      setLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('İzin Reddedildi', 'Anlık konumunuzu alabilmek için konum izni gereklidir.');
        setLoadingGps(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const detectedCity = item.city || item.region || 'İstanbul';
        const detectedDistrict = item.subregion || item.district || 'Beşiktaş';
        const detectedStreet = [item.street, item.streetNumber, item.name].filter(Boolean).join(' ');

        setCity(detectedCity);
        setDistrict(detectedDistrict);
        setFullAddress(`${detectedStreet}, ${detectedDistrict} / ${detectedCity}`);

        if (!title) setTitle('Mevcut Konumum');
        setFieldErrors({});
        Alert.alert('📍 Konum Algılandı', `Adresiniz GPS üzerinden dolduruldu:\n${detectedDistrict} / ${detectedCity}`);
      }
    } catch (error) {
      console.error('GPS konum alınamadı:', error);
      Alert.alert('Hata', 'Anlık konum alınırken bir sorun oluştu.');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSave = () => {
    const errors: { title?: string; fullAddress?: string } = {};

    if (!title.trim()) {
      errors.title = 'Adres başlığı girilmesi zorunludur.';
    }

    if (!fullAddress.trim()) {
      errors.fullAddress = 'Açık adres girilmesi zorunludur.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Alert.alert('Eksik Bilgi', 'Lütfen kırmızı ile belirtilen tüm zorunlu alanları doldurun.');
      return;
    }

    setFieldErrors({});

    const newAddress: UserAddress = {
      id: `addr_${Date.now()}`,
      title: title.trim(),
      fullName: fullName.trim() || 'Ahmet Yılmaz',
      phone: phone.trim() || '0555 123 45 67',
      city: city.trim() || 'İstanbul',
      district: district.trim() || 'Beşiktaş',
      fullAddress: fullAddress.trim(),
    };

    onSaveAddress(newAddress);

    // Reset form
    setTitle('');
    setFullName('');
    setPhone('');
    setCity('');
    setDistrict('');
    setFullAddress('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>{t('addNewAddress')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {/* GPS Location Button */}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleFetchCurrentGpsLocation}
              disabled={loadingGps}
              activeOpacity={0.8}
            >
              {loadingGps ? (
                <ActivityIndicator color="#00236f" size="small" />
              ) : (
                <>
                  <MaterialIcons name="my-location" size={20} color="#00236f" />
                  <Text style={styles.gpsButtonText}>{t('useGpsLocation')}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Address Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurface }]}>
                {t('addressTitleLabel')} <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { borderColor: fieldErrors.title ? colors.error : colors.outlineVariant, color: colors.onBackground },
                  fieldErrors.title ? { borderWidth: 1.5 } : null
                ]}
                placeholder="Örn: Evim, İş Yeri, Yazlık"
                placeholderTextColor={colors.onSurfaceVariant}
                value={title}
                onChangeText={(val) => {
                  setTitle(val);
                  if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: undefined }));
                }}
              />
              {!!fieldErrors.title && (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.title}</Text>
              )}
            </View>

            {/* Name & Phone Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.onSurface }]}>{t('receiverFullNameLabel')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onBackground }]}
                  placeholder="Ahmet Yılmaz"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.onSurface }]}>{t('phoneLabel')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onBackground }]}
                  placeholder="05xx xxx xx xx"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* City & District */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.onSurface }]}>{t('cityLabel')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onBackground }]}
                  placeholder="İstanbul"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.onSurface }]}>{t('districtLabel')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onBackground }]}
                  placeholder="Beşiktaş"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>
            </View>

            {/* Full Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.onSurface }]}>
                {t('fullAddressLabel')} <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.inputMulti, 
                  { borderColor: fieldErrors.fullAddress ? colors.error : colors.outlineVariant, color: colors.onBackground },
                  fieldErrors.fullAddress ? { borderWidth: 1.5 } : null
                ]}
                placeholder="Mahalle, Cadde, Sokak, Bina No, Daire No"
                placeholderTextColor={colors.onSurfaceVariant}
                value={fullAddress}
                onChangeText={(val) => {
                  setFullAddress(val);
                  if (fieldErrors.fullAddress) setFieldErrors(prev => ({ ...prev, fullAddress: undefined }));
                }}
                multiline
                numberOfLines={3}
              />
              {!!fieldErrors.fullAddress && (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.fullAddress}</Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <MaterialIcons name="save" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>{t('saveAddressBtn')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    gap: 16,
    paddingBottom: 24,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingVertical: 12,
  },
  gpsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00236f',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputMulti: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
