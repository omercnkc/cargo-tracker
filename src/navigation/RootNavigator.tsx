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

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
      <Stack.Screen name="AddPackage" component={AddPackageScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="CarrierSelection" component={CarrierSelectionScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
