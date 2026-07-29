import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useAuthStore } from '../store/auth.store';
import { KeyboardAwareContainer } from '../components/common/KeyboardAwareContainer';

export const LoginScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Basic breakpoint for tablet/desktop
  const isLargeScreen = width >= 1024;

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    setErrorMessage('');
    const res = await signIn(email.trim(), password);
    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <View style={styles.container}>
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
                <MaterialIcons name="inventory" size={40} color={colors.onPrimary} />
                <Text style={styles.brandingLogoText}>KargoTakip</Text>
              </View>

              {/* Bottom Copy */}
              <View style={styles.brandingCopy}>
                <Text style={styles.brandingTitle}>Küresel lojistik,{'\n'}tek bir ekranda.</Text>
                <Text style={styles.brandingSubtitle}>
                  Güvenilirlik, şeffaflık ve hız. Gönderilerinizi anlık olarak izleyin ve operasyonlarınızı pürüzsüzce yönetin.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* Right Pane: Login Form */}
      <KeyboardAwareContainer 
        style={[styles.rightPane, { width: isLargeScreen ? '50%' : '100%' }]}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
        ]}
      >
        <View style={styles.formContainer}>
          
          {/* Mobile Header */}
          {!isLargeScreen && (
            <View style={styles.mobileHeader}>
              <MaterialIcons name="inventory" size={48} color={colors.primary} />
              <Text style={styles.mobileLogoText}>KargoTakip</Text>
            </View>
          )}

          {/* Welcome Text */}
          <View style={[styles.welcomeSection, !isLargeScreen && styles.welcomeSectionMobile]}>
            <Text style={styles.welcomeTitle}>Tekrar Hoş Geldiniz</Text>
            <Text style={styles.welcomeSubtitle}>Devam etmek için hesap bilgilerinizi girin.</Text>
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
            
            {/* Email Input Group */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-Posta Adresi</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="mail" size={20} color={colors.outline} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@sirket.com"
                  placeholderTextColor={colors.outlineVariant}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input Group */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPassword}>Şifremi Unuttum</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="lock" size={20} color={colors.outline} />
                </View>
                <TextInput
                  style={[styles.input, styles.inputWithRightIcon]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outlineVariant}
                  value={password}
                  onChangeText={setPassword}
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
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Giriş Yap</Text>
                  <MaterialIcons name="arrow-forward" size={20} color={colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>
            
          </View>

          {/* Registration Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>
              Hesabınız yok mu?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAwareContainer>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  leftPane: {
    width: '50%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  leftPaneContent: {
    flex: 1,
    padding: 48,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  brandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandingLogoText: {
    fontFamily: 'Inter',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.64,
    color: colors.onPrimary,
  },
  brandingCopy: {
    maxWidth: 400,
    paddingBottom: 48,
  },
  brandingTitle: {
    fontFamily: 'Inter',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.onPrimary,
    marginBottom: 16,
  },
  brandingSubtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.primaryFixedDim,
    opacity: 0.9,
  },
  rightPane: {
    height: '100%',
    backgroundColor: colors.surfaceContainerLowest,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  mobileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  mobileLogoText: {
    fontFamily: 'Inter',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.24,
    color: colors.primary,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeSectionMobile: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontFamily: 'Inter',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.64,
    color: colors.onSurface,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
  },
  forgotPassword: {
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.error,
    flex: 1,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
  },
  inputIconRight: {
    position: 'absolute',
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    color: colors.onSurface,
    paddingVertical: 14,
    paddingLeft: 44,
    paddingRight: 16,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    // Note: React Native Shadow
    shadowColor: colors.primaryContainer,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.onPrimary,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  registerText: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
  },
  registerLink: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
