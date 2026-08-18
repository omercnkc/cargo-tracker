import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { useAuthStore } from '../store/auth.store';
import { useTranslation } from '../hooks/useTranslation';
import { KeyboardAwareContainer } from '../components/common/KeyboardAwareContainer';
import { styles } from './AuthScreens.styles';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme: colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const resetPassword = useAuthStore((state) => state.resetPassword);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setEmailError(t('emailRequired'));
      setMessage({ type: 'error', text: t('emailRequired') });
      return;
    } else if (!email.includes('@') || !email.includes('.')) {
      setEmailError(t('validEmailRequired'));
      setMessage({ type: 'error', text: t('validEmailRequired') });
      return;
    }

    setEmailError('');
    setMessage(null);
    const res = await resetPassword(email.trim());
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({
        type: 'success',
        text: t('passwordResetLinkSent'),
      });
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
        {/* Main Card */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialIcons name="lock-reset" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>{t('forgotPasswordTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {t('forgotPasswordSubtitle')}
            </Text>
          </View>

          {/* Message Box */}
          {message && (
            <View style={[
              styles.messageBox,
              message.type === 'error'
                ? { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#FFEBEE', borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#FFCDD2' }
                : { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#E8F5E9', borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : '#C8E6C9' }
            ]}>
              <MaterialIcons 
                name={message.type === 'error' ? 'error-outline' : 'check-circle-outline'} 
                size={20} 
                color={message.type === 'error' ? colors.error : (isDarkMode ? '#34D399' : '#2E7D32')} 
              />
              <Text style={[
                styles.messageText,
                { color: message.type === 'error' ? colors.error : (isDarkMode ? '#34D399' : '#2E7D32') }
              ]}>{message.text}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.onSurface }]}>
                {t('emailLabel')} <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? colors.surfaceContainerLow : colors.surface,
                    borderColor: emailError ? colors.error : colors.outlineVariant,
                    borderWidth: emailError ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.inputIconLeft}>
                  <MaterialIcons name="mail" size={20} color={emailError ? colors.error : colors.outline} />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.onSurface }]}
                  placeholder={t('emailPlaceholder')}
                  placeholderTextColor={colors.outlineVariant}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {!!emailError && (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '500' }}>{emailError}</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }, isLoading && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>{t('sendResetLinkBtn')}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>
            
          </View>

          {/* Back to Login Link */}
          <TouchableOpacity 
            style={styles.backLinkContainer} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <MaterialIcons name="arrow-back" size={18} color={colors.primary} />
            <Text style={[styles.backLinkText, { color: colors.primary }]}>{t('backToLogin')}</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAwareContainer>
    </View>
  );
};

export default ForgotPasswordScreen;
