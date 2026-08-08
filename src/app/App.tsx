import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from '../navigation/RootNavigator';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/useTheme';
import ErrorBoundary from '../components/common/ErrorBoundary';

const queryClient = new QueryClient();

const AppContent = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} animated={true} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default App;
