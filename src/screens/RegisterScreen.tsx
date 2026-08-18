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
import { useTheme } from '../theme/useTheme';
import { useAuthStore } from '../store/auth.store';
import { KeyboardAwareContainer } from '../components/common/KeyboardAwareContainer';
import { GoogleLogo } from '../components/common/GoogleLogo';
import { useTranslation } from '../hooks/useTranslation';
import { PasswordInput, PasswordStrengthMeter } from '../components/ui';
import { validatePassword, validateFullName } from '../utils/validators';
import { hapticService } from '../services/haptics.service';

export const RegisterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { theme: colors, isDarkMode } = useTheme();

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
    hapticService.buttonPress();
    setErrorMessage('');
    const res = await signInWithGoogle();
    if (res?.error) {
      hapticService.error();
      setErrorMessage(res.error);
    } else {
      hapticService.success();
    }
  };

  const handleRegister = async () => {
    hapticService.buttonPress();
    const errors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};

    const nameVal = validateFullName(fullName);
    if (!nameVal.isValid) {
      errors.fullName = nameVal.error;
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
      hapticService.error();
      setFieldErrors(errors);
      setErrorMessage(t('fixRequiredFieldsMsg'));
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    const res = await signUp(email.trim(), password, fullName.trim());
    if (res.error) {
      hapticService.error();
      setErrorMessage(res.error);
    } else {
      hapticService.success();
      Alert.alert(
        t('registerSuccessTitle'),
        t('registerSuccessMsg'),
        [{ text: t('loginBtn'), onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            <View style={[styles.logoBadge, { backgroundColor: isDarkMode ? colors.surfaceContainerHigh : colors.primaryContainer }]}>
              <MaterialIcons name="local-shipping" size={32} color={isDarkMode ? colors.primary : colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>{t('appName')}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t('registerSubtitle')}</Text>
          </View>

          {/* Error Message Box */}
          {!!errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#FFEBEE', borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#FFCDD2' }]}>
              <MaterialIcons name="error-outline" size={20} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>

            {/* Inputs Group Card */}
            <View style={[styles.inputsCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
                  {t('fullNameLabel')} <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDarkMode ? colors.surfaceContainerLow : colors.surface,
                      borderColor: fieldErrors.fullName ? colors.error : colors.outlineVariant,
                      borderWidth: fieldErrors.fullName ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="person" size={20} color={fieldErrors.fullName ? colors.error : colors.outline} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.onSurface }]}
                    placeholder={t('fullNamePlaceholder')}
                    placeholderTextColor={colors.outlineVariant}
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
                <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
                  {t('emailLabel')} <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDarkMode ? colors.surfaceContainerLow : colors.surface,
                      borderColor: fieldErrors.email ? colors.error : colors.outlineVariant,
                      borderWidth: fieldErrors.email ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="mail" size={20} color={fieldErrors.email ? colors.error : colors.outline} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.onSurface }]}
                    placeholder={t('emailPlaceholder')}
                    placeholderTextColor={colors.outlineVariant}
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

            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }, isLoading && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <>
                    <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>{t('registerBtn')}</Text>
                    <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
                <Text style={[styles.dividerText, { color: colors.onSurfaceVariant }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity
                style={[styles.googleButton, { backgroundColor: isDarkMode ? colors.surfaceContainer : '#ffffff', borderColor: colors.outlineVariant }]}
                activeOpacity={0.85}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleLogo size={22} />
                <Text style={[styles.googleButtonText, { color: colors.onSurface }]}>Google {t('registerBtn')}</Text>
              </TouchableOpacity>

              <View style={styles.loginLinkContainer}>
                <Text style={[styles.loginLinkText, { color: colors.onSurfaceVariant }]}>{t('alreadyHaveAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={[styles.loginLinkHighlight, { color: colors.primary }]}>{t('loginBtn')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={[styles.termsText, { color: colors.outline }]}>
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
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.64,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  inputsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 14,
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
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    borderRadius: 4,
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
    height: 48,
    paddingLeft: 40,
    paddingRight: 16,
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
  },
  dividerText: {
    fontFamily: 'Inter',
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 4,
    height: 48,
  },
  googleButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontFamily: 'Inter',
    fontSize: 14,
  },
  loginLinkHighlight: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
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
    textAlign: 'center',
  },
});

export default RegisterScreen;
