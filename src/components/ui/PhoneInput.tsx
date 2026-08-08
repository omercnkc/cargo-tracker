import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { formatPhoneNumber, cleanPhoneNumber } from '../../utils/formatter';
import { useTranslation } from '../../hooks/useTranslation';

export interface PhoneInputProps {
  value: string;
  onChangeText: (formattedValue: string, cleanDigits: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function PhoneInput({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  required = false,
  containerStyle,
}: PhoneInputProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const handleTextChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    const clean = cleanPhoneNumber(formatted);
    onChangeText(formatted, clean);
  };

  const handleClear = () => {
    onChangeText('', '');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={[styles.label, { color: colors.onBackground }]}>
          {label} {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surfaceContainerLowest || colors.surface,
            borderColor: error ? colors.error : colors.outlineVariant,
            borderWidth: error ? 1.5 : 1,
          },
        ]}
      >
        {/* Country Badge (TR Only) */}
        <View
          style={[
            styles.countryBadge,
            { backgroundColor: colors.surfaceContainerHighest || colors.outlineVariant + '30' },
          ]}
        >
          <Text style={styles.flagIcon}>🇹🇷</Text>
          <Text style={[styles.countryCode, { color: colors.onSurface }]}>+90</Text>
        </View>

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.onSurface,
            },
          ]}
          placeholder={placeholder || t('phonePlaceholder') || '0 (5XX) XXX XX XX'}
          placeholderTextColor={colors.outlineVariant}
          value={value}
          onChangeText={handleTextChange}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={18}
        />

        {/* Clear Icon */}
        {!!value && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Telefonu temizle"
          >
            <MaterialIcons name="cancel" size={18} color={colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 8,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  flagIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
