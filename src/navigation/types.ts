export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: { screen?: string; params?: any } | undefined;
  PackageDetail: { 
    id?: string; 
    shipmentId?: string; 
    trackingNumber?: string; 
    title?: string;
    shipment?: any;
    package?: any;
  };
  AddPackage: { scannedTrackingNumber?: string } | undefined;
  Search: undefined;
  Notifications: undefined;
  Settings: undefined;
  CarrierSelection: undefined;
  Scanner: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Packages: undefined;
  AddPackage: { scannedTrackingNumber?: string } | undefined;
  Statistics: undefined;
  Profile: undefined;
};
