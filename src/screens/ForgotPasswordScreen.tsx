import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

export const ForgotPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
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
          {/* Main Card */}
          <View style={styles.card}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="lock-reset" size={36} color={colors.primary} />
              </View>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter the email address associated with your KargoTakip account and we'll send you a link to reset your password.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <MaterialIcons name="mail" size={20} color={colors.outline} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.outline}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
                <Text style={styles.submitButtonText}>Send Reset Link</Text>
                <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
              </TouchableOpacity>
              
            </View>

            {/* Back to Login Link */}
            <TouchableOpacity style={styles.backLinkContainer} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={18} color={colors.primary} />
              <Text style={styles.backLinkText}>Back to Login</Text>
            </TouchableOpacity>

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
  keyboardView: {
    flex: 1,
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
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 24, // headline-lg-mobile (desktop typically uses 32, adapting for mobile first)
    fontWeight: '700',
    letterSpacing: -0.24,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
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
  input: {
    fontFamily: 'Inter',
    fontSize: 14, // body-sm
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    color: colors.onSurface,
    height: 48,
    paddingLeft: 40,
    paddingRight: 12,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
    marginTop: 8,
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
  backLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  backLinkText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.primary,
  },
});

export default ForgotPasswordScreen;
