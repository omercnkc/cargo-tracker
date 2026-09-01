import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Linking, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';

import RootNavigator from '../navigation/RootNavigator';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/useTheme';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ToastProvider } from '../providers/ToastProvider';
import { supabase } from '../services/supabase/supabase';
import { authRepository } from '../features/auth/repositories/auth.repository';

import { OfflinePersistProvider } from '../providers/OfflinePersistProvider';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineNetworkBanner } from '../components/common/OfflineNetworkBanner';

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();


const AppContent = () => {
  useNetworkStatus();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const { isDarkMode, theme: colors } = useTheme();

  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.onSurface,
      border: colors.outlineVariant,
      primary: colors.primary,
    },
  };

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Google OAuth Callback Handler
   */
  useEffect(() => {
    const handleUrl = async (url: string) => {
      // Callback veya code/access_token içermiyorsa yoksay
      if (!url.includes('auth/callback') && !url.includes('code=') && !url.includes('access_token=')) {
        return;
      }

      try {
        // Regex ile code parametresini kesin olarak çek (URL parse hatalarını önler)
        const codeMatch = url.match(/[?&#]code=([^&]+)/);
        const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            Alert.alert('Google Giriş Hatası', error.message);
          } else if (data.user) {
            await authRepository.syncUserProfileFromAuth(data.user);
            useAuthStore.getState().fetchProfile(data.user.id);
          }
        } else {
          // Token doğrudan URL hash'inde gelebilir
          const accessTokenMatch = url.match(/[?&#]access_token=([^&]+)/);
          const refreshTokenMatch = url.match(/[?&#]refresh_token=([^&]+)/);

          if (accessTokenMatch && refreshTokenMatch) {
            const access_token = decodeURIComponent(accessTokenMatch[1]);
            const refresh_token = decodeURIComponent(refreshTokenMatch[1]);

            const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) {
              Alert.alert('Oturum Hatası', error.message);
            } else if (data.user) {
              await authRepository.syncUserProfileFromAuth(data.user);
              useAuthStore.getState().fetchProfile(data.user.id);
            }
          }
        }
      } catch (e) {
        console.error('[OAuth DeepLink] Handler exception:', e);
      }
    };

    const subscription = Linking.addEventListener('url', (e) => handleUrl(e.url));

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Synchronize native Android/iOS system status bar immediately on theme toggle
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(colors.surface, true);
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
    }
  }, [isDarkMode, colors.surface]);

  return (
    <>
      <StatusBar
        key={`status-bar-${isDarkMode ? 'dark' : 'light'}`}
        style={isDarkMode ? 'light' : 'dark'}
        backgroundColor={colors.surface}
        translucent={Platform.OS === 'android'}
        animated={true}
      />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
      <OfflineNetworkBanner />
    </>
  );
};

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ErrorBoundary>
      <OfflinePersistProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SafeAreaProvider>
      </OfflinePersistProvider>
    </ErrorBoundary>
  </GestureHandlerRootView>
);

export default App;
