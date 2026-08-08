import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useAuthStore } from '../store/auth.store';
import { KeyboardAwareContainer } from '../components/common/KeyboardAwareContainer';
import { GoogleLogo } from '../components/common/GoogleLogo';
import { useTranslation } from '../hooks/useTranslation';
import { PasswordInput, PasswordStrengthMeter } from '../components/ui';
import { validatePassword } from '../utils/validators';

export const RegisterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const signUp = useAuthStore((state) => state.signUp);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    const res = await signInWithGoogle();
    if (res?.error) {
      setErrorMessage(res.error);
    }
  };

  const handleRegister = async () => {
    const errors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!fullName.trim()) {
      errors.fullName = t('fullNameRequired');
    }

    if (!email.trim()) {
      errors.email = t('emailRequired');
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = t('validEmailRequired');
    }

    const passValidation = validatePassword(password);
    if (!password) {
      errors.password = t('passwordRequired');
    } else if (!passValidation.isValid) {
      errors.password = passValidation.errors[0];
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('confirmPasswordRequired');
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t('passwordsDontMatch');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(t('fixRequiredFieldsMsg'));
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    const res = await signUp(email.trim(), password, fullName.trim());
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      Alert.alert(
        t('registerSuccessTitle'),
        t('registerSuccessMsg'),
        [{ text: t('loginBtn'), onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareContainer
        style={styles.keyboardView}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
        ]}
      >
        {/* Registration Container */}
        <View style={styles.formContainer}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>KargoTakip</Text>
            <Text style={styles.subtitle}>{t('registerSubtitle')}</Text>
          </View>

          {/* Error Message Box */}
          {!!errorMessage && (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('fullNameLabel')} <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, fieldErrors.fullName ? { borderColor: colors.error, borderWidth: 1.5 } : null]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="person" size={20} color={fieldErrors.fullName ? colors.error : colors.outline} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('fullNamePlaceholder')}
                  placeholderTextColor={colors.outline}
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                />
              </View>
              {!!fieldErrors.fullName && (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.fullName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('emailLabel')} <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, fieldErrors.email ? { borderColor: colors.error, borderWidth: 1.5 } : null]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="mail" size={20} color={fieldErrors.email ? colors.error : colors.outline} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('emailPlaceholder')}
                  placeholderTextColor={colors.outline}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {!!fieldErrors.email && (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.email}</Text>
              )}
            </View>

            {/* Password */}
            <PasswordInput
              label={t('passwordLabel')}
              placeholder={t('passwordPlaceholder')}
              required
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
            />

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {/* Confirm Password */}
            <PasswordInput
              label={t('confirmPasswordLabel')}
              placeholder={t('confirmPasswordPlaceholder')}
              required
              leftIconName="lock-reset"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              error={fieldErrors.confirmPassword}
            />

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>{t('registerBtn')}</Text>
                    <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity
                style={styles.googleButton}
                activeOpacity={0.85}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleLogo size={22} />
                <Text style={styles.googleButtonText}>Google {t('registerBtn')}</Text>
              </TouchableOpacity>

              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>{t('alreadyHaveAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLinkHighlight}>{t('loginBtn')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                {t('termsAgreementText')}
              </Text>
            </View>

          </View>
        </View>
      </KeyboardAwareContainer>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 448,
    gap: 24,
    paddingVertical: 12,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.64,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.error,
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurface,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  inputIconRight: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 4, // rounded-DEFAULT
    color: colors.onSurface,
    height: 48,
    paddingLeft: 40,
    paddingRight: 16,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  actionsContainer: {
    gap: 16,
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  submitButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  googleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 4,
    height: 48,
  },
  googleButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  loginLinkHighlight: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  termsText: {
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 16,
    color: colors.outline,
    textAlign: 'center',
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
