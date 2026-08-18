import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { useAuthStore } from '../store/auth.store';
import { KeyboardAwareContainer } from '../components/common/KeyboardAwareContainer';
import { GoogleLogo } from '../components/common/GoogleLogo';
import { useTranslation } from '../hooks/useTranslation';
import { PasswordInput } from '../components/ui';
import { hapticService } from '../services/haptics.service';
import { styles } from './AuthScreens.styles';

export const LoginScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme: colors, isDarkMode } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const signIn = useAuthStore((state) => state.signIn);
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

  // Basic breakpoint for tablet/desktop
  const isLargeScreen = width >= 1024;

  const handleLogin = async () => {
    hapticService.buttonPress();
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'E-posta adresi girilmesi zorunludur.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Lütfen geçerli bir e-posta adresi girin.';
    }

    if (!password) {
      errors.password = 'Şifre girilmesi zorunludur.';
    }

    if (Object.keys(errors).length > 0) {
      hapticService.error();
      setFieldErrors(errors);
      setErrorMessage('Lütfen kırmızı ile belirtilen tüm zorunlu alanları doldurun.');
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    const res = await signIn(email.trim(), password);
    if (res.error) {
      hapticService.error();
      setErrorMessage(res.error);
    } else {
      hapticService.success();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Left Pane: Branding & Visuals (Visible only on large screens) */}
      {isLargeScreen && (
        <View style={styles.leftPane}>
          <ImageBackground 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVxZDI4ooxSt7ko4iJVOPTI4wFesWLVLZ3sNluIewvRDYqej_uAwRSIdSmrODmuGvU-FOgkro4ecLiBMMV1s1CaES4t44D9fEV1VRzwN73bx_LaXUT1xDRnhdSAKg4fecGfSbdmNFGhC5IywPDstDi_J0VsyQWm5KNSLYkpH9VyTEm5eUQv4aRfQ41-ChVYdeU-tyYCbz6Hjxz395O7vdzvBqIrwSkhPcBB1DMx2DTiSS0xYdVd3eTvjeKxnxTu0umqlv3T6kcP_Y' }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Overlays */}
            <View style={[styles.overlay, { backgroundColor: 'rgba(0, 35, 111, 0.90)' }]} />
            
            <View style={[styles.leftPaneContent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
              {/* Top Branding */}
              <View style={styles.brandingHeader}>
                <MaterialIcons name="local-shipping" size={40} color={colors.onPrimary} />
                <Text style={[styles.brandingLogoText, { color: colors.onPrimary }]}>{t('appName')}</Text>
              </View>

              {/* Bottom Copy */}
              <View style={styles.brandingCopy}>
                <Text style={[styles.brandingTitle, { color: colors.onPrimary }]}>Küresel lojistik,{'\n'}tek bir ekranda.</Text>
                <Text style={[styles.brandingSubtitle, { color: colors.primaryFixedDim }]}>
                  Güvenilirlik, şeffaflık ve hız. Gönderilerinizi anlık olarak izleyin ve operasyonlarınızı pürüzsüzce yönetin.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* Right Pane: Login Form */}
      <KeyboardAwareContainer 
        style={[styles.rightPane, { width: isLargeScreen ? '50%' : '100%', backgroundColor: colors.surfaceContainerLowest }]}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
        ]}
      >
        <View style={styles.formContainer}>
          
          {/* Mobile Header */}
          {!isLargeScreen && (
            <View style={styles.mobileHeader}>
              <View style={[styles.logoBadge, { backgroundColor: isDarkMode ? colors.surfaceContainerHigh : colors.primaryContainer }]}>
                <MaterialIcons name="local-shipping" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.mobileLogoText, { color: colors.primary }]}>{t('appName')}</Text>
            </View>
          )}

          {/* Welcome Text */}
          <View style={[styles.welcomeSection, !isLargeScreen && styles.welcomeSectionMobile]}>
            <Text style={[styles.welcomeTitle, { color: colors.onSurface }]}>{t('loginWelcomeTitle')}</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.onSurfaceVariant }]}>{t('loginWelcomeSubtitle')}</Text>
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

              {/* Email Input Group */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
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

              {/* Password Input Group */}
              <PasswordInput
                label={t('passwordLabel')}
                required
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                }}
                error={fieldErrors.password}
                rightHeaderAction={
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={[styles.forgotPassword, { color: colors.primary }]}>{t('forgotPasswordTitle')}</Text>
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }, isLoading && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>{t('loginBtn')}</Text>
                  <MaterialIcons name="arrow-forward" size={20} color={colors.onPrimary} />
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
              <Text style={[styles.googleButtonText, { color: colors.onSurface }]}>Google {t('loginBtn')}</Text>
            </TouchableOpacity>

          </View>

          {/* Registration Link */}
          <View style={styles.registerSection}>
            <Text style={[styles.registerText, { color: colors.onSurfaceVariant }]}>
              {t('dontHaveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>{t('registerBtn')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAwareContainer>
    </View>
  );
};

export default LoginScreen;
