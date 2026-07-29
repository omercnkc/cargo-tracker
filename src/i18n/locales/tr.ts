export const tr = {
  // General
  appName: 'KargoTakip',
  welcome: 'Merhaba',
  welcomeSubtitle: 'Bugün kargolarınızın durumunu takip edin.',
  searchPlaceholder: 'Takip numarası girin...',
  searchCarriers: 'Kargo firmalarında ara...',
  save: 'Kaydet',
  cancel: 'İptal',
  close: 'Kapat',
  error: 'Hata',
  success: 'Başarılı',
  loading: 'Yükleniyor...',

  // Statuses
  statusInTransit: 'Dağıtımda',
  statusDelivered: 'Teslim Edildi',
  statusPending: 'Bekliyor',

  // Stats
  delivered: 'Teslim Edilen',
  pending: 'Bekleyen',
  inTransit: 'Dağıtımda',

  // Actions
  addPackage: 'Paket Ekle',
  qrScan: 'QR Tara',
  seeAll: 'Tümünü Gör',
  recentPackages: 'Son Kargolar',
  trackNewShipment: 'Yeni Kargo Takip Et',
  enterTrackingDetails: 'Kargonuzu takip etmek için aşağıdaki bilgileri girin.',
  trackingNumberLabel: 'TAKİP NUMARASI',
  carrierLabel: 'KARGO FİRMASI',
  selectCarrier: 'Kargo Firması Seçin...',
  packageNicknameLabel: 'Paket Adı',
  optional: 'Opsiyonel',
  savePackage: 'Kargoyu Kaydet',

  // Settings
  settings: 'Ayarlar',
  preferences: 'Tercihler',
  pushNotifications: 'Anlık Bildirimler',
  pushNotificationsDesc: 'Kargo güncellemeleri hakkında bildirim al',
  darkMode: 'Karanlık Mod',
  darkModeDesc: 'Koyu tema görünümüne geç',
  language: 'Uygulama Dili',
  languageDesc: 'Uygulama dilini değiştirin',
  account: 'Hesap',
  profileSettings: 'Profil Ayarları',
  signOut: 'Oturumu Kapat',
  signOutConfirm: 'Oturumu kapatmak istediğinize emin misiniz?',

  // Detail
  shipmentDetail: 'Kargo Detayı',
  deliveryInfo: 'Teslimat Bilgileri',
  estimatedDelivery: 'TAHMİNİ TESLİMAT',
  sender: 'GÖNDERİCİ',
  receiver: 'ALICI',
  lastLocation: 'Son Konum',
  timeline: 'Hareket Geçmişi',
  noEvents: 'Henüz hareket kaydı bulunamadı.',

  // Search
  searchTitle: 'Kargo Ara',
  recentSearches: 'Son Aramalar',
  noResults: 'Kargo bulunamadı',
};

export type TranslationKeys = typeof tr;
