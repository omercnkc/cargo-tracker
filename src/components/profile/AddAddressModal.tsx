import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  PanResponder,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../store/auth.store';
import { PhoneInput } from '../ui';
import { AddressSelectModal, SelectOption } from './AddressSelectModal';
import { styles } from './AddAddressModal.styles';
import {
  getProvinces,
  getDistrictsByCityId,
  getNeighborhoodsByDistrictId,
} from '../../services/addressData.service';
import { ErrorHandler, AppErrorCode } from '../../services/error/errorHandler.service';
import { InlineErrorBanner } from '../common/InlineErrorBanner';
import { formatTitleCaseTR, formatPhoneClean } from '../../utils/stringFormatters';
import { validateFullName, validatePhone } from '../../utils/validators';
import { hapticService } from '../../services/haptics.service';

export interface UserAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsSuccessInfo, setGpsSuccessInfo] = useState<{
    district: string;
    city: string;
    street?: string;
  } | null>(null);
  const [gpsInlineError, setGpsInlineError] = useState<{
    title?: string;
    message: string;
    type?: 'warning' | 'error' | 'info';
  } | null>(null);
  const [formBanner, setFormBanner] = useState<{
    title?: string;
    message: string;
    type?: 'warning' | 'error' | 'info';
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    fullName?: string;
    phone?: string;
    city?: string;
    district?: string;
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

  // PanResponder for drag-down-to-dismiss gesture
  const panY = useRef(new Animated.Value(600)).current;

  const handleDismiss = () => {
    Animated.timing(panY, {
      toValue: 600,
      duration: 200,
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
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.4) {
          handleDismiss();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            friction: 7,
            tension: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Auto-fill user name & surname when modal opens, animate sheet up
  useEffect(() => {
    if (visible) {
      panY.setValue(600);
      Animated.spring(panY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 240,
        useNativeDriver: true,
      }).start();

      setGpsSuccessInfo(null);
      setGpsInlineError(null);
      setFormBanner(null);
      const userFullName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        (user?.email ? user.email.split('@')[0] : '');

      if (userFullName && !fullName) {
        setFullName(userFullName);
      }
    }
  }, [visible, user, profile]);

  /**
   * Fast & Reliable GPS Location Fetching with Smart Neighborhood & Address Autocomplete
   */
  const handleFetchCurrentGpsLocation = async () => {
    hapticService.buttonPress();
    try {
      setLoadingGps(true);
      setGpsInlineError(null);
      setFormBanner(null);
      setGpsSuccessInfo(null);

      // Check if location services (GPS) are enabled at device level first
      const hasServices = await Location.hasServicesEnabledAsync();
      if (!hasServices) {
        hapticService.warning();
        const payload = ErrorHandler.handleError(AppErrorCode.GPS_DISABLED, 'AddAddressModal', { mode: 'none' });
        setGpsInlineError({ title: payload.title, message: payload.message, type: payload.isWarning ? 'warning' : 'error' });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        hapticService.warning();
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
        hapticService.error();
        const payload = ErrorHandler.handleError(AppErrorCode.GPS_UNAVAILABLE, 'AddAddressModal', { mode: 'none' });
        setGpsInlineError({ title: payload.title, message: payload.message, type: payload.isWarning ? 'warning' : 'error' });
        return;
      }

      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      let geocode: Location.LocationGeocodedAddress[] | null = null;
      try {
        geocode = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        // Reverse geocoding requires internet. If offline, keep coordinates and notify user gracefully.
        geocode = null;
      }

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const detectedCity = item.city || item.region || 'İstanbul';
        const detectedDistrict = item.subregion || item.district || 'Beşiktaş';
        const detectedStreet = [item.street, item.streetNumber]
          .filter(Boolean)
          .join(' ');

        // Find city & district in local database for automatic picker sync
        const foundCity = getProvinces().find(
          (p) =>
            p.sehir_adi.toLocaleLowerCase('tr-TR') === detectedCity.trim().toLocaleLowerCase('tr-TR') ||
            detectedCity.trim().toLocaleLowerCase('tr-TR').includes(p.sehir_adi.toLocaleLowerCase('tr-TR'))
        );

        let foundDistrict: any = null;
        let foundNeighborhood: any = null;

        if (foundCity) {
          setSelectedCity({ id: foundCity.sehir_id, name: foundCity.sehir_adi });
          const districts = getDistrictsByCityId(foundCity.sehir_id);
          foundDistrict = districts.find(
            (d) =>
              d.ilce_adi.toLocaleLowerCase('tr-TR') === detectedDistrict.trim().toLocaleLowerCase('tr-TR') ||
              detectedDistrict.trim().toLocaleLowerCase('tr-TR').includes(d.ilce_adi.toLocaleLowerCase('tr-TR'))
          );

          if (foundDistrict) {
            setSelectedDistrict({ id: foundDistrict.ilce_id, name: foundDistrict.ilce_adi });
            const neighborhoods = getNeighborhoodsByDistrictId(foundDistrict.ilce_id);

            // Match neighborhood from reverse geocode (item.district, item.name, item.street)
            const rawNeighborhoodCandidate = (item.district || item.name || '').toLocaleLowerCase('tr-TR');
            foundNeighborhood = neighborhoods.find(
              (n) =>
                (rawNeighborhoodCandidate && n.mahalle_adi.toLocaleLowerCase('tr-TR').includes(rawNeighborhoodCandidate)) ||
                (rawNeighborhoodCandidate && rawNeighborhoodCandidate.includes(n.mahalle_adi.toLocaleLowerCase('tr-TR')))
            );

            if (foundNeighborhood) {
              setSelectedNeighborhood({ id: foundNeighborhood.mahalle_id, name: foundNeighborhood.mahalle_adi });
            }
          }
        }

        const finalNeighborhood = foundNeighborhood?.mahalle_adi || item.district || item.name || '';
        const finalDistrict = foundDistrict?.ilce_adi || detectedDistrict;
        const finalCity = foundCity?.sehir_adi || detectedCity;

        setCity(finalCity);
        setDistrict(finalDistrict);
        if (finalNeighborhood) {
          setNeighborhood(finalNeighborhood);
        }

        const addressParts = [
          finalNeighborhood,
          detectedStreet,
          `${finalDistrict} / ${finalCity}`,
        ].filter(Boolean);

        setFullAddress(addressParts.join(', '));

        if (!title) setTitle(t('myCurrentLocation'));
        setFieldErrors({});
        setGpsInlineError(null);
        setFormBanner(null);
        hapticService.success();
        setGpsSuccessInfo({
          district: finalDistrict,
          city: finalCity,
          street: detectedStreet,
        });
      } else {
        if (!title) setTitle(t('myCurrentLocation'));
        hapticService.warning();
        setGpsInlineError({
          title: t('reverseGeocodeOfflineTitle'),
          message: t('reverseGeocodeOfflineWarning'),
          type: 'warning',
        });
      }
    } catch (error) {
      hapticService.error();
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
    hapticService.selection();
    setFormBanner(null);
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
      hapticService.warning();
      setFormBanner({
        title: t('missingInfo'),
        message: t('selectCityFirst'),
        type: 'warning',
      });
      return;
    }

    hapticService.selection();
    setFormBanner(null);
    const cityId = selectedCity?.id;
    if (!cityId) {
      // If city was entered manually via text or GPS
      const foundCity = getProvinces().find(
        (p) => p.sehir_adi.toLocaleLowerCase('tr-TR') === city.trim().toLocaleLowerCase('tr-TR')
      );
      if (!foundCity) {
        hapticService.warning();
        setFormBanner({
          title: t('missingInfo'),
          message: t('selectCityFirst'),
          type: 'warning',
        });
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
      hapticService.warning();
      setFormBanner({
        title: t('missingInfo'),
        message: t('selectCityFirst'),
        type: 'warning',
      });
      return;
    }
    if (!selectedDistrict && !district) {
      hapticService.warning();
      setFormBanner({
        title: t('missingInfo'),
        message: t('selectDistrictFirst'),
        type: 'warning',
      });
      return;
    }

    hapticService.selection();
    setFormBanner(null);
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
    hapticService.selection();
    setFormBanner(null);
    if (pickerModalType === 'city') {
      setSelectedCity(option);
      setCity(option.name);
      if (fieldErrors.city) {
        setFieldErrors((prev) => ({ ...prev, city: undefined }));
      }

      // Reset downstream selections (İlçe & Mahalle)
      setSelectedDistrict(null);
      setDistrict('');
      setSelectedNeighborhood(null);
      setNeighborhood('');
    } else if (pickerModalType === 'district') {
      setSelectedDistrict(option);
      setDistrict(option.name);
      if (fieldErrors.district) {
        setFieldErrors((prev) => ({ ...prev, district: undefined }));
      }

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
    const errors: {
      title?: string;
      fullName?: string;
      phone?: string;
      city?: string;
      district?: string;
      fullAddress?: string;
    } = {};

    if (!title.trim()) {
      errors.title = t('addressTitleRequired');
    }

    if (!fullName.trim()) {
      errors.fullName = t('receiverFullNameRequired');
    } else {
      const nameVal = validateFullName(fullName);
      if (!nameVal.isValid) {
        errors.fullName = nameVal.error;
      }
    }

    if (!phone.trim()) {
      errors.phone = t('phoneRequired');
    } else {
      const phoneVal = validatePhone(phone);
      if (!phoneVal.isValid) {
        errors.phone = phoneVal.error;
      }
    }

    if (!city.trim() && !selectedCity) {
      errors.city = t('cityRequired');
    }

    if (!district.trim() && !selectedDistrict) {
      errors.district = t('districtRequired');
    }

    if (!fullAddress.trim()) {
      errors.fullAddress = t('fullAddressRequired');
    }

    if (Object.keys(errors).length > 0) {
      hapticService.error();
      setFieldErrors(errors);
      setFormBanner({
        title: t('missingInfo'),
        message: t('addressValidationWarning'),
        type: 'warning',
      });
      return;
    }

    hapticService.success();
    setFieldErrors({});
    setFormBanner(null);

    const newAddress: UserAddress = {
      id: `addr_${Date.now()}`,
      title: formatTitleCaseTR(title.trim()),
      fullName: formatTitleCaseTR(fullName.trim()),
      phone: formatPhoneClean(phone.trim()),
      city: formatTitleCaseTR(city.trim() || selectedCity?.name || ''),
      district: formatTitleCaseTR(district.trim() || selectedDistrict?.name || ''),
      fullAddress: fullAddress.trim(),
      latitude: coords?.latitude,
      longitude: coords?.longitude,
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
    setCoords(null);
    setGpsSuccessInfo(null);
    setGpsInlineError(null);
    setFormBanner(null);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleDismiss}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surfaceContainerLowest,
                transform: [{ translateY: panY }],
              },
            ]}
          >
            {/* Top Sheet Drag Handle Bar ("-") with PanResponder */}
            <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.outlineVariant }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                {t('addNewAddress')}
              </Text>
              <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
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

              {/* GPS Inline Success Feedback Banner */}
              {gpsSuccessInfo && (
                <View
                  style={[
                    styles.gpsSuccessBox,
                    {
                      backgroundColor: colors.surface === '#121212' || colors.background === '#121212'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : '#ECFDF5',
                      borderColor: colors.surface === '#121212' || colors.background === '#121212'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : '#A7F3D0',
                    },
                  ]}
                >
                  <View style={styles.gpsSuccessIconWrapper}>
                    <MaterialIcons name="check-circle" size={22} color="#059669" />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.gpsSuccessTitle}>
                      {t('locationDetectedTitle')}
                    </Text>
                    <Text style={styles.gpsSuccessSubtext}>
                      {t('locationDetectedDesc')}
                    </Text>
                    <View style={styles.gpsLocationBadge}>
                      <MaterialIcons name="place" size={14} color="#059669" />
                      <Text style={styles.gpsLocationBadgeText}>
                        {gpsSuccessInfo.district} / {gpsSuccessInfo.city}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setGpsSuccessInfo(null)}
                    style={styles.gpsSuccessDismiss}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={18} color="#047857" />
                  </TouchableOpacity>
                </View>
              )}
              {/* GPS Inline Error/Warning Banner directly in-context inside the modal */}
              {gpsInlineError && (
                <InlineErrorBanner
                  title={gpsInlineError.title}
                  message={gpsInlineError.message}
                  type={gpsInlineError.type}
                  onDismiss={() => setGpsInlineError(null)}
                />
              )}

              {/* Form Validation Warning Banner */}
              {formBanner && (
                <InlineErrorBanner
                  title={formBanner.title}
                  message={formBanner.message}
                  type={formBanner.type}
                  onDismiss={() => setFormBanner(null)}
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
                  placeholder={t('addressTitlePlaceholder')}
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={title}
                  onChangeText={(val) => {
                    setTitle(val);
                    if (formBanner) setFormBanner(null);
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
                  {t('receiverFullNameLabel')}{' '}
                  <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: fieldErrors.fullName
                        ? colors.error
                        : colors.outlineVariant,
                      color: colors.onBackground,
                    },
                    fieldErrors.fullName ? { borderWidth: 1.5 } : null,
                  ]}
                  placeholder="Ahmet Yılmaz"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (fieldErrors.fullName) {
                      setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                    }
                  }}
                />
                {!!fieldErrors.fullName && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.error,
                      marginTop: 4,
                      fontWeight: '500',
                    }}
                  >
                    {fieldErrors.fullName}
                  </Text>
                )}
              </View>

              {/* Phone Input */}
              <PhoneInput
                label={t('phoneLabel')}
                value={phone}
                required={true}
                error={fieldErrors.phone}
                onChangeText={(formatted) => {
                  setPhone(formatted);
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
              />

              {/* City & District (Lazy Evaluation Selectors) */}
              <View style={styles.row}>
                {/* İl Selector */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.onSurface }]}>
                    {t('cityLabel')}{' '}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        borderColor: fieldErrors.city
                          ? colors.error
                          : colors.outlineVariant,
                        backgroundColor: colors.surfaceContainer,
                      },
                      fieldErrors.city ? { borderWidth: 1.5 } : null,
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
                  {!!fieldErrors.city && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.error,
                        marginTop: 4,
                        fontWeight: '500',
                      }}
                    >
                      {fieldErrors.city}
                    </Text>
                  )}
                </View>

                {/* İlçe Selector (Requires City Selection) */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.onSurface }]}>
                    {t('districtLabel')}{' '}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        borderColor: fieldErrors.district
                          ? colors.error
                          : colors.outlineVariant,
                        backgroundColor: colors.surfaceContainer,
                        opacity: city ? 1 : 0.6,
                      },
                      fieldErrors.district ? { borderWidth: 1.5 } : null,
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
                  {!!fieldErrors.district && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.error,
                        marginTop: 4,
                        fontWeight: '500',
                      }}
                    >
                      {fieldErrors.district}
                    </Text>
                  )}
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
          </Animated.View>
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

export default AddAddressModal;
