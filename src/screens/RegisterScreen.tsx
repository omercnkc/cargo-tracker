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
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import Constants from 'expo-constants';

import colors from '../theme/colors';
import { useAuthStore } from '../store/auth.store';
import { GOOGLE_CONFIG } from '../config/google.config';
import { KeyboardAwareContainer } from '../components/common/KeyboardAwareContainer';
import { GoogleLogo } from '../components/common/GoogleLogo';
import { useTranslation } from '../hooks/useTranslation';

WebBrowser.maybeCompleteAuthSession();

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

export const RegisterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const signUp = useAuthStore((state) => state.signUp);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CONFIG.androidClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
    scopes: GOOGLE_CONFIG.scopes,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken || response.params?.id_token;
      if (idToken) {
        signInWithGoogle(idToken).then((res) => {
          if (res.error) setErrorMessage(res.error);
        });
      } else {
        setErrorMessage('Google kimlik doğrulaması tamamlanamadı.');
      }
    }
  }, [response]);

  const handleRegister = async () => {
    const errors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Ad Soyad girilmesi zorunludur.';
    }

    if (!email.trim()) {
      errors.email = 'E-posta adresi girilmesi zorunludur.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Lütfen geçerli bir e-posta adresi girin.';
    }

    if (!password) {
      errors.password = 'Şifre girilmesi zorunludur.';
    } else if (password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı girilmesi zorunludur.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Şifreler birbiriyle eşleşmiyor.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Lütfen kırmızı ile belirtilen tüm zorunlu alanları düzeltin.');
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    const res = await signUp(email.trim(), password, fullName.trim());
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      Alert.alert(
        'Kayıt Başarılı',
        'Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.',
        [{ text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Decorative ambient background */}
      <View style={styles.ambientBackground} pointerEvents="none">
        <View style={styles.ambientCircleTopLeft} />
        <View style={styles.ambientCircleBottomRight} />
      </View>

      <KeyboardAwareContainer 
        style={styles.keyboardView}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
        ]}
      >
        {/* Registration Container */}
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>KargoTakip</Text>
            <Text style={styles.subtitle}>Kargo takibine başlamak için hesap oluşturun.</Text>
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
                Ad Soyad <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, fieldErrors.fullName ? { borderColor: colors.error, borderWidth: 1.5 } : null]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="person" size={20} color={fieldErrors.fullName ? colors.error : colors.outline} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Adınız Soyadınız"
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
                E-Posta Adresi <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, fieldErrors.email ? { borderColor: colors.error, borderWidth: 1.5 } : null]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="mail" size={20} color={fieldErrors.email ? colors.error : colors.outline} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@sirket.com"
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
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Şifre <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, fieldErrors.password ? { borderColor: colors.error, borderWidth: 1.5 } : null]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="lock" size={20} color={fieldErrors.password ? colors.error : colors.outline} />
                </View>
                <TextInput
                  style={[styles.input, styles.inputWithRightIcon]}
                  placeholder="Güçlü bir şifre girin"
                  placeholderTextColor={colors.outline}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity 
                  style={styles.inputIconRight}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <MaterialIcons 
                    name={isPasswordVisible ? 'visibility' : 'visibility-off'} 
                    size={20} 
                    color={colors.outline} 
                  />
                </TouchableOpacity>
              </View>
              {!!fieldErrors.password && (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Şifre Tekrarı <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, fieldErrors.confirmPassword ? { borderColor: colors.error, borderWidth: 1.5 } : null]}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="lock-reset" size={20} color={fieldErrors.confirmPassword ? colors.error : colors.outline} />
                </View>
                <TextInput
                  style={[styles.input, styles.inputWithRightIcon]}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor={colors.outline}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <TouchableOpacity 
                  style={styles.inputIconRight}
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  <MaterialIcons 
                    name={isConfirmPasswordVisible ? 'visibility' : 'visibility-off'} 
                    size={20} 
                    color={colors.outline} 
                  />
                </TouchableOpacity>
              </View>
              {!!fieldErrors.confirmPassword && (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{fieldErrors.confirmPassword}</Text>
              )}
            </View>

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
                onPress={() => promptAsync()}
                disabled={isLoading || !request}
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
                Hesap oluşturarak <Text style={styles.termsLink}>Kullanım Koşulları</Text> ve <Text style={styles.termsLink}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
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
  ambientBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  ambientCircleTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.surfaceContainerHigh,
    opacity: 0.6,
    // Add simple blur effect approximation for native
    shadowColor: colors.surfaceContainerHigh,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 20,
  },
  ambientCircleBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.surfaceVariant,
    opacity: 0.6,
    shadowColor: colors.surfaceVariant,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 20,
  },
  keyboardView: {
    flex: 1,
    zIndex: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16, // margin-mobile
  },
  card: {
    width: '100%',
    maxWidth: 448, // max-w-md
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 24, // container-padding
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: 32,
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
