import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../store/auth.store';
import { PhoneInput } from '../ui';
import { AddressSelectModal, SelectOption } from './AddressSelectModal';
import {
  getProvinces,
  getDistrictsByCityId,
  getNeighborhoodsByDistrictId,
} from '../../services/addressData.service';
import { ErrorHandler, AppErrorCode } from '../../services/error/errorHandler.service';
import { InlineErrorBanner } from '../common/InlineErrorBanner';
import { formatTitleCaseTR, formatPhoneClean } from '../../utils/stringFormatters';

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

export function AddAddressModal({
  visible,
  onClose,
  onSaveAddress,
}: AddAddressModalProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsInlineError, setGpsInlineError] = useState<{
    title?: string;
    message: string;
    type?: 'warning' | 'error' | 'info';
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    fullAddress?: string;
  }>({});

  // Address Selection States for Lazy Evaluation
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<SelectOption | null>(null);

  // Picker Modal State
  const [pickerModalType, setPickerModalType] = useState<
    'city' | 'district' | 'neighborhood' | null
  >(null);
  const [pickerOptions, setPickerOptions] = useState<SelectOption[]>([]);
  const [pickerTitle, setPickerTitle] = useState('');
  const [loadingPickerOptions, setLoadingPickerOptions] = useState(false);

  // Auto-fill user name & surname when modal opens
  useEffect(() => {
    if (visible) {
      setGpsInlineError(null);
      const userFullName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        (user?.email ? user.email.split('@')[0] : '');

      if (userFullName && !fullName) {
        setFullName(userFullName);
      }
    }
  }, [visible, user, profile]);

  /**
   * Fast & Reliable GPS Location Fetching
   */
  const handleFetchCurrentGpsLocation = async () => {
    try {
      setLoadingGps(true);
      setGpsInlineError(null);

      // Check if location services (GPS) are enabled at device level first
      const hasServices = await Location.hasServicesEnabledAsync();
      if (!hasServices) {
        const payload = ErrorHandler.handleError(AppErrorCode.GPS_DISABLED, 'AddAddressModal', { mode: 'none' });
        setGpsInlineError({ title: payload.title, message: payload.message, type: payload.isWarning ? 'warning' : 'error' });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const payload = ErrorHandler.handleError(AppErrorCode.LOCATION_PERMISSION_DENIED, 'AddAddressModal', { mode: 'none' });
        setGpsInlineError({ title: payload.title, message: payload.message, type: payload.isWarning ? 'warning' : 'error' });
        return;
      }

      // Fast path: try cached last known position first (near-instant)
      let position = await Location.getLastKnownPositionAsync({});

      // If no cached location available, request current position with 6-second timeout limit
      if (!position) {
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 6000)
        );
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        position = await Promise.race([locationPromise, timeoutPromise]);
      }

      if (!position) {
        const payload = ErrorHandler.handleError(AppErrorCode.GPS_UNAVAILABLE, 'AddAddressModal', { mode: 'none' });
        setGpsInlineError({ title: payload.title, message: payload.message, type: payload.isWarning ? 'warning' : 'error' });
        return;
      }

      const geocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const detectedCity = item.city || item.region || 'İstanbul';
        const detectedDistrict = item.subregion || item.district || 'Beşiktaş';
        const detectedStreet = [item.street, item.streetNumber, item.name]
          .filter(Boolean)
          .join(' ');

        setCity(detectedCity);
        setDistrict(detectedDistrict);
        setFullAddress(
          `${detectedStreet}, ${detectedDistrict} / ${detectedCity}`
        );

        if (!title) setTitle('Mevcut Konumum');
        setFieldErrors({});
        setGpsInlineError(null);
        Alert.alert(
          '📍 Konum Algılandı',
          `Adresiniz GPS üzerinden dolduruldu:\n${detectedDistrict} / ${detectedCity}`
        );
      } else {
        const payload = ErrorHandler.handleError(AppErrorCode.GPS_UNAVAILABLE, 'AddAddressModal', { mode: 'none' });
        setGpsInlineError({ title: payload.title, message: payload.message, type: payload.isWarning ? 'warning' : 'error' });
      }
    } catch (error) {
      const payload = ErrorHandler.handleError(error, 'AddAddressModal', { mode: 'none' });
      setGpsInlineError({ title: payload.title, message: payload.message, type: payload.isWarning ? 'warning' : 'error' });
    } finally {
      setLoadingGps(false);
    }
  };

  /**
   * Lazy Evaluation Handlers for Address Selection
   */
  const handleOpenCityPicker = () => {
    const provinces = getProvinces();
    const options: SelectOption[] = provinces.map((p) => ({
      id: p.sehir_id,
      name: p.sehir_adi,
    }));
    setPickerTitle(t('selectCity'));
    setPickerOptions(options);
    setPickerModalType('city');
  };

  const handleOpenDistrictPicker = () => {
    if (!selectedCity && !city) {
      Alert.alert('Bilgi', t('selectCityFirst'));
      return;
    }

    const cityId = selectedCity?.id;
    if (!cityId) {
      // If city was entered manually via text or GPS
      const foundCity = getProvinces().find(
        (p) => p.sehir_adi.toLocaleLowerCase('tr-TR') === city.trim().toLocaleLowerCase('tr-TR')
      );
      if (!foundCity) {
        Alert.alert('Bilgi', t('selectCityFirst'));
        return;
      }
      const districts = getDistrictsByCityId(foundCity.sehir_id);
      setPickerOptions(districts.map((d) => ({ id: d.ilce_id, name: d.ilce_adi })));
    } else {
      const districts = getDistrictsByCityId(cityId);
      setPickerOptions(districts.map((d) => ({ id: d.ilce_id, name: d.ilce_adi })));
    }

    setPickerTitle(t('selectDistrict'));
    setPickerModalType('district');
  };

  const handleOpenNeighborhoodPicker = () => {
    if (!selectedCity && !city) {
      Alert.alert('Bilgi', t('selectCityFirst'));
      return;
    }
    if (!selectedDistrict && !district) {
      Alert.alert('Bilgi', t('selectDistrictFirst'));
      return;
    }

    setLoadingPickerOptions(true);
    setPickerTitle(t('selectNeighborhood'));
    setPickerModalType('neighborhood');

    // Asynchronously load neighborhood chunk to prevent blocking main UI thread
    setTimeout(() => {
      let districtId = selectedDistrict?.id;
      if (!districtId) {
        const foundCity = getProvinces().find(
          (p) => p.sehir_adi.toLocaleLowerCase('tr-TR') === city.trim().toLocaleLowerCase('tr-TR')
        );
        if (foundCity) {
          const foundDistrict = getDistrictsByCityId(foundCity.sehir_id).find(
            (d) => d.ilce_adi.toLocaleLowerCase('tr-TR') === district.trim().toLocaleLowerCase('tr-TR')
          );
          districtId = foundDistrict?.ilce_id;
        }
      }

      if (districtId) {
        const neighborhoods = getNeighborhoodsByDistrictId(districtId);
        setPickerOptions(neighborhoods.map((n) => ({ id: n.mahalle_id, name: n.mahalle_adi })));
      } else {
        setPickerOptions([]);
      }
      setLoadingPickerOptions(false);
    }, 50);
  };

  const handleOptionSelect = (option: SelectOption) => {
    if (pickerModalType === 'city') {
      setSelectedCity(option);
      setCity(option.name);

      // Reset downstream selections (İlçe & Mahalle)
      setSelectedDistrict(null);
      setDistrict('');
      setSelectedNeighborhood(null);
      setNeighborhood('');
    } else if (pickerModalType === 'district') {
      setSelectedDistrict(option);
      setDistrict(option.name);

      // Reset downstream selection (Mahalle)
      setSelectedNeighborhood(null);
      setNeighborhood('');
    } else if (pickerModalType === 'neighborhood') {
      setSelectedNeighborhood(option);
      setNeighborhood(option.name);

      // Append neighborhood to full address if desired
      const currentCity = city || selectedCity?.name || '';
      const currentDistrict = district || selectedDistrict?.name || '';
      const formattedNeighborhood = option.name;

      if (formattedNeighborhood) {
        setFullAddress(`${formattedNeighborhood}, ${currentDistrict} / ${currentCity}`);
      }
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
      Alert.alert(
        'Eksik Bilgi',
        'Lütfen kırmızı ile belirtilen tüm zorunlu alanları doldurun.'
      );
      return;
    }

    setFieldErrors({});

    const newAddress: UserAddress = {
      id: `addr_${Date.now()}`,
      title: formatTitleCaseTR(title),
      fullName: formatTitleCaseTR(fullName.trim() || 'Ahmet Yılmaz'),
      phone: formatPhoneClean(phone.trim() || '05551234567'),
      city: formatTitleCaseTR(city.trim() || 'İstanbul'),
      district: formatTitleCaseTR(district.trim() || 'Beşiktaş'),
      fullAddress: fullAddress.trim(),
    };

    onSaveAddress(newAddress);

    // Reset form
    setTitle('');
    setFullName('');
    setPhone('');
    setCity('');
    setDistrict('');
    setNeighborhood('');
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedNeighborhood(null);
    setFullAddress('');
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surfaceContainerLowest },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                {t('addNewAddress')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
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
                    <Text style={styles.gpsButtonText}>
                      {t('useGpsLocation')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* GPS Inline Error/Warning Banner directly in-context inside the modal */}
              {gpsInlineError && (
                <InlineErrorBanner
                  title={gpsInlineError.title}
                  message={gpsInlineError.message}
                  type={gpsInlineError.type}
                  onDismiss={() => setGpsInlineError(null)}
                />
              )}

              {/* Address Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurface }]}>
                  {t('addressTitleLabel')}{' '}
                  <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: fieldErrors.title
                        ? colors.error
                        : colors.outlineVariant,
                      color: colors.onBackground,
                    },
                    fieldErrors.title ? { borderWidth: 1.5 } : null,
                  ]}
                  placeholder="Örn: Evim, İş Yeri, Yazlık"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={title}
                  onChangeText={(val) => {
                    setTitle(val);
                    if (fieldErrors.title)
                      setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                />
                {!!fieldErrors.title && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.error,
                      marginTop: 4,
                      fontWeight: '500',
                    }}
                  >
                    {fieldErrors.title}
                  </Text>
                )}
              </View>

              {/* Receiver Full Name (Auto-filled with logged-in user name) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurface }]}>
                  {t('receiverFullNameLabel')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.outlineVariant,
                      color: colors.onBackground,
                    },
                  ]}
                  placeholder="Ahmet Yılmaz"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Phone Input */}
              <PhoneInput
                label={t('phoneLabel')}
                value={phone}
                onChangeText={(formatted) => setPhone(formatted)}
              />

              {/* City & District (Lazy Evaluation Selectors) */}
              <View style={styles.row}>
                {/* İl Selector */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.onSurface }]}>
                    {t('cityLabel')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        borderColor: colors.outlineVariant,
                        backgroundColor: colors.surfaceContainer,
                      },
                    ]}
                    onPress={handleOpenCityPicker}
                    activeOpacity={0.8}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.selectButtonText,
                        {
                          color: city ? colors.onBackground : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {city || t('selectCity')}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>

                {/* İlçe Selector (Requires City Selection) */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.onSurface }]}>
                    {t('districtLabel')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        borderColor: colors.outlineVariant,
                        backgroundColor: colors.surfaceContainer,
                        opacity: city ? 1 : 0.6,
                      },
                    ]}
                    onPress={handleOpenDistrictPicker}
                    activeOpacity={0.8}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.selectButtonText,
                        {
                          color: district ? colors.onBackground : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {district || t('selectDistrict')}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mahalle Selector (Requires City & District Selection) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurface }]}>
                  {t('neighborhoodLabel')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    {
                      borderColor: colors.outlineVariant,
                      backgroundColor: colors.surfaceContainer,
                      opacity: district ? 1 : 0.6,
                    },
                  ]}
                  onPress={handleOpenNeighborhoodPicker}
                  activeOpacity={0.8}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.selectButtonText,
                      {
                        color: neighborhood
                          ? colors.onBackground
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {neighborhood || t('selectNeighborhood')}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>

              {/* Full Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.onSurface }]}>
                  {t('fullAddressLabel')}{' '}
                  <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.inputMulti,
                    {
                      borderColor: fieldErrors.fullAddress
                        ? colors.error
                        : colors.outlineVariant,
                      color: colors.onBackground,
                    },
                    fieldErrors.fullAddress ? { borderWidth: 1.5 } : null,
                  ]}
                  placeholder="Mahalle, Cadde, Sokak, Bina No, Daire No"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={fullAddress}
                  onChangeText={(val) => {
                    setFullAddress(val);
                    if (fieldErrors.fullAddress)
                      setFieldErrors((prev) => ({
                        ...prev,
                        fullAddress: undefined,
                      }));
                  }}
                  multiline
                  numberOfLines={3}
                />
                {!!fieldErrors.fullAddress && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.error,
                      marginTop: 4,
                      fontWeight: '500',
                    }}
                  >
                    {fieldErrors.fullAddress}
                  </Text>
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <MaterialIcons name="save" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {t('saveAddressBtn')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Address Item Selection Modal */}
      <AddressSelectModal
        visible={pickerModalType !== null}
        title={pickerTitle}
        options={pickerOptions}
        selectedValue={
          pickerModalType === 'city'
            ? city
            : pickerModalType === 'district'
            ? district
            : neighborhood
        }
        loading={loadingPickerOptions}
        onSelect={handleOptionSelect}
        onClose={() => setPickerModalType(null)}
      />
    </>
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectButtonText: {
    fontSize: 14,
    flex: 1,
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
