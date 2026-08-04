import { TranslationKeys } from './tr';

export const en: TranslationKeys = {
  // General
  appName: 'CargoTracker',
  welcome: 'Welcome',
  welcomeSubtitle: 'Track the status of your shipments today.',
  searchPlaceholder: 'Enter tracking number...',
  searchCarriers: 'Search carriers...',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  error: 'Error',
  success: 'Success',
  loading: 'Loading...',

  // Statuses
  statusInTransit: 'In Transit',
  statusDelivered: 'Delivered',
  statusPending: 'Pending',

  // Stats
  delivered: 'Delivered',
  pending: 'Pending',
  inTransit: 'In Transit',

  // Actions & Navigation
  addPackage: 'Add Package',
  qrScan: 'QR Scan',
  seeAll: 'See All',
  recentPackages: 'Recent Packages',
  trackNewShipment: 'Track a New Shipment',
  enterTrackingDetails: 'Enter the details below to start tracking your cargo.',
  trackingNumberLabel: 'TRACKING NUMBER',
  carrierLabel: 'CARRIER',
  selectCarrier: 'Select Carrier...',
  packageNicknameLabel: 'Package Nickname',
  optional: 'Optional',
  savePackage: 'Save Package',

  // Add Package Screen
  addPackageTitle: 'Add New Package',
  addPackageSubtitle: 'Enter tracking details to monitor your shipment in real-time.',
  clipboardDetectedPrefix: '📋 Detected in clipboard: ',
  clipboardDetectedSuffix: ' (Tap to apply)',
  autoImportEmail: 'Auto Import from Email',
  autoImportSubtitle: 'Automatically scan Trendyol, Hepsiburada, and Amazon emails',
  trackingNumberRequired: 'Tracking number is required.',
  carrierRequired: 'Carrier selection is required.',
  missingFieldsTitle: 'Required Fields Missing',
  missingFieldsMsg: 'Please fill in the required fields highlighted in red.',
  authRequiredTitle: 'Session Not Found',
  authRequiredMsg: 'You must be signed in to add a package.',
  addSuccessTitle: 'Shipment Added Successfully',
  addSuccessMsg: 'Your shipment is now tracked. You will be notified of status changes.',
  addErrorTitle: 'Failed to Add Shipment',

  // Packages Screen
  allPackagesTitle: 'All My Packages',
  searchPlaceholderPackage: 'Tracking no, carrier, or nickname...',
  allFilter: 'All',
  filterClear: 'Clear Filters',
  noPackagesFound: 'No Packages Found',
  noPackagesFoundSub: 'No shipment records match your search criteria.',
  originLabel: 'Origin',
  destinationLabel: 'Destination',
  detailsBtn: 'Details',
  deliveryDateLabel: 'Est. Delivery',
  deliveredDateLabel: 'Delivered Date',

  // Statistics Screen
  statisticsTitle: 'Statistics',
  totalCargo: 'Total Packages',
  avgDeliveryTime: 'Avg. Delivery Time',
  deliverySuccess: 'Delivery Success',
  monthlyDistribution: 'Monthly Distribution',
  courierBreakdown: 'Courier Distribution',
  filterByMonth: 'Filter',
  clearFilter: 'Clear Filter',

  // Notifications Screen
  notificationsTitle: 'Notifications',
  markAllAsRead: 'Mark All as Read',
  noNotifications: 'No Notifications Yet',
  noNotificationsSub: 'Real-time updates will appear here when your shipment status changes.',

  // Carrier Selection
  carriersTitle: 'Courier Companies',
  noCarriersFound: 'No carrier found',
  tryDifferentSearch: 'Try searching for a different name.',

  // Scanner Screen
  scannerTitle: 'Barcode / QR Scanner',
  cameraPermissionTitle: 'Camera Permission Required',
  cameraPermissionMsg: 'Camera permission is required to scan barcodes or QR codes.',
  grantPermission: 'Grant Permission',

  // Profile & Auth
  profileTitle: 'Profile',
  loginTitle: 'Sign In',
  registerTitle: 'Sign Up',
  forgotPasswordTitle: 'Forgot Password',
  emailLabel: 'Email Address',
  passwordLabel: 'Password',
  fullNameLabel: 'Full Name',
  loginBtn: 'Sign In',
  registerBtn: 'Sign Up',
  forgotPasswordLink: 'Forgot your password?',
  dontHaveAccount: 'Don\'t have an account?',
  alreadyHaveAccount: 'Already have an account?',

  // Settings
  settings: 'Settings',
  preferences: 'Preferences',
  pushNotifications: 'Push Notifications',
  pushNotificationsDesc: 'Get real-time tracking updates',
  darkMode: 'Dark Mode',
  darkModeDesc: 'Switch to dark theme appearance',
  language: 'App Language',
  languageDesc: 'Change application language',
  account: 'Account',
  profileSettings: 'Profile Settings',
  signOut: 'Sign Out',
  signOutConfirm: 'Are you sure you want to sign out?',

  // Detail
  shipmentDetail: 'Shipment Detail',
  deliveryInfo: 'Delivery Information',
  estimatedDelivery: 'ESTIMATED DELIVERY',
  sender: 'SENDER',
  receiver: 'RECEIVER',
  lastLocation: 'Last Location',
  timeline: 'Tracking Timeline',
  noEvents: 'No tracking events found yet.',

  // Search
  searchTitle: 'Search Cargo',
  recentSearches: 'Recent Searches',
  noResults: 'No shipments found',
};
