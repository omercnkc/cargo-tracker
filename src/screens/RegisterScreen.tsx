import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

export const RegisterScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      
      {/* Decorative ambient background */}
      <View style={styles.ambientBackground} pointerEvents="none">
        <View style={styles.ambientCircleTopLeft} />
        <View style={styles.ambientCircleBottomRight} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Registration Container */}
          <View style={styles.card}>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>KargoTakip</Text>
              <Text style={styles.subtitle}>Create an account to start tracking.</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="person" size={20} color={colors.outline} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.outline}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="mail" size={20} color={colors.outline} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="name@company.com"
                    placeholderTextColor={colors.outline}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="lock" size={20} color={colors.outline} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.inputWithRightIcon]}
                    placeholder="Create a strong password"
                    placeholderTextColor={colors.outline}
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

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="lock-reset" size={20} color={colors.outline} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.inputWithRightIcon]}
                    placeholder="Repeat your password"
                    placeholderTextColor={colors.outline}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
                  <Text style={styles.submitButtonText}>Create Account</Text>
                  <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
                </TouchableOpacity>
                
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>Already have an account? </Text>
                  <TouchableOpacity>
                    <Text style={styles.loginLinkHighlight}>Log in</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
