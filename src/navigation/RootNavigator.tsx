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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // App Stack
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
            <Stack.Screen name="AddPackage" component={AddPackageScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="CarrierSelection" component={CarrierSelectionScreen} />
            <Stack.Screen name="Scanner" component={ScannerScreen} />
          </Stack.Group>
        ) : (
          // Auth Stack
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
