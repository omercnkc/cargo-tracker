import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Linking, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import RootNavigator from '../navigation/RootNavigator';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/useTheme';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ToastProvider } from '../providers/ToastProvider';
import { supabase } from '../services/supabase/supabase';
import { authRepository } from '../features/auth/repositories/auth.repository';

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

const AppContent = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Google OAuth Callback Handler
   */
  useEffect(() => {
    const handleUrl = async (url: string) => {
      console.log('[OAuth DeepLink] Received URL:', url);

      // Callback veya code/access_token içermiyorsa yoksay
      if (!url.includes('auth/callback') && !url.includes('code=') && !url.includes('access_token=')) {
        return;
      }

      try {
        // Regex ile code parametresini kesin olarak çek (URL parse hatalarını önler)
        const codeMatch = url.match(/[?&#]code=([^&]+)/);
        const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

        if (code) {
          console.log('[OAuth DeepLink] Exchanging code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[OAuth DeepLink] Exchange Error:', error.message);
            Alert.alert('Google Giriş Hatası', error.message);
          } else if (data.user) {
            console.log('[OAuth DeepLink] Session created for:', data.user.email);
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

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} animated />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
};

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </GestureHandlerRootView>
);

export default App;
