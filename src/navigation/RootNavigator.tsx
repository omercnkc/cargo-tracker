import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import BottomTabs from './BottomTabs';
import PackageDetailScreen from '../screens/PackageDetailScreen';
import AddPackageScreen from '../screens/AddPackageScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CarrierSelectionScreen from '../screens/CarrierSelectionScreen';
import ScannerScreen from '../screens/ScannerScreen';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/auth.store';
import { useBiometrics } from '../hooks/useBiometrics';
import { useModalStore } from '../store/modal.store';

import DrawerMenuModal from '../components/common/DrawerMenuModal';
import { BiometricLockModal } from '../components/auth/BiometricLockModal';
import { AddressManagementModal } from '../components/profile/AddressManagementModal';
import { ChangePasswordModal } from '../components/common/ChangePasswordModal';
import { SupportHelpModal } from '../components/common/SupportHelpModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const { isLocked, unlockApp, biometricTypes } = useBiometrics();

  const {
    addressModalOpen,
    closeAddressModal,
    changePasswordModalOpen,
    closeChangePasswordModal,
    supportModalOpen,
    supportModalType,
    closeSupportModal,
  } = useModalStore();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 220,
          gestureEnabled: true,
        }}
      >
        {isAuthenticated ? (
          // App Stack
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={BottomTabs} options={{ animation: 'fade' }} />
            <Stack.Screen name="PackageDetail" component={PackageDetailScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="AddPackage" component={AddPackageScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="CarrierSelection" component={CarrierSelectionScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Scanner" component={ScannerScreen} options={{ animation: 'slide_from_bottom' }} />
          </Stack.Group>
        ) : (
          // Auth Stack
          <Stack.Group screenOptions={{ animation: 'fade_from_bottom' }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animation: 'slide_from_right' }} />
          </Stack.Group>
        )}
      </Stack.Navigator>

      {/* App Drawers & Global Modals */}
      {isAuthenticated && (
        <>
          <DrawerMenuModal />

          <AddressManagementModal
            visible={addressModalOpen}
            onClose={closeAddressModal}
          />

          <ChangePasswordModal
            visible={changePasswordModalOpen}
            onClose={closeChangePasswordModal}
          />

          <SupportHelpModal
            visible={supportModalOpen}
            type={supportModalType}
            onClose={closeSupportModal}
          />

          <BiometricLockModal
            visible={isLocked}
            onAuthenticate={unlockApp}
            biometricType={biometricTypes[0] || 'Face ID / Parmak İzi'}
          />
        </>
      )}
    </>
  );
};

export default RootNavigator;
