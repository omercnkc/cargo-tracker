import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Expo Go SDK 53+ Android push notification uyarısını bastırır (Expo Go kısıtlaması)
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'Android Push notifications (remote notifications)',
  'remotely-triggered notifications',
  'was removed from Expo Go',
]);

import App from './src/app/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
