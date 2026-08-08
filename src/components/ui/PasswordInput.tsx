import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';

export interface PasswordInputProps extends Omit<TextInputProps, 'onChangeText' | 'value' | 'secureTextEntry'> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  leftIconName?: keyof typeof MaterialIcons.glyphMap;
  rightHeaderAction?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function PasswordInput({
  value,
  onChangeText,
  label,
  placeholder = '••••••••',
  error,
  required = false,
  leftIconName = 'lock',
  rightHeaderAction,
  containerStyle,
  ...rest
}: PasswordInputProps) {
  const { theme: colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {(!!label || !!rightHeaderAction) && (
        <View style={styles.headerRow}>
          {!!label && (
            <Text style={[styles.label, { color: colors.onBackground }]}>
              {label} {required && <Text style={{ color: colors.error }}>*</Text>}
            </Text>
          )}
          {rightHeaderAction}
        </View>
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
        <View style={styles.inputIconLeft}>
          <MaterialIcons
            name={leftIconName}
            size={20}
            color={error ? colors.error : colors.outline}
          />
        </View>

        <TextInput
          style={[
            styles.input,
            {
              color: colors.onSurface,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.outlineVariant}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />

        <TouchableOpacity
          style={styles.inputIconRight}
          onPress={() => setIsPasswordVisible((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? 'Şifreyi gizle' : 'Şifreyi göster'}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isPasswordVisible ? 'visibility' : 'visibility-off'}
            size={20}
            color={colors.outline}
          />
        </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
  },
  inputIconRight: {
    padding: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
