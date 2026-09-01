import { MaterialIcons } from '@expo/vector-icons';
import { UserAddress } from '../components/profile/AddAddressModal';

export interface DisplayPackage {
  id: string;
  name: string;
  code: string;
  status: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export const FALLBACK_HOME_PACKAGES: DisplayPackage[] = [
  { id: 'mock-1', name: 'Kablosuz Kulaklık', code: 'Trendyol Express • TY7382910482', status: 'out_for_delivery', icon: 'local-shipping' },
  { id: 'mock-2', name: 'Mekanik Klavye', code: 'Hepsijet • HJ9482019384', status: 'transit', icon: 'local-shipping' },
  { id: 'mock-3', name: 'Deri Sırt Çantası', code: 'Yurtiçi Kargo • YK8473920194', status: 'destination', icon: 'store' },
  { id: 'mock-4', name: 'Koşu Ayakkabısı', code: 'Aras Kargo • AR2948103947', status: 'delivered', icon: 'check-circle' },
  { id: 'mock-5', name: 'Tasarım Kitapları', code: 'Sürat Kargo • SK1928374650', status: 'created', icon: 'pending' },
  { id: 'mock-6', name: 'Filtre Kahve Çekirdeği', code: 'Kargoist • KG8392019381', status: 'received', icon: 'inventory' },
  { id: 'mock-7', name: 'Geliştirici Kiti', code: 'DHL Express • DHL9382019283', status: 'transit', icon: 'local-shipping' },
  { id: 'mock-8', name: 'Akıllı Ev Sensörü', code: 'FedEx • FDX0928374619', status: 'delivered', icon: 'check-circle' },
];

export const getMockShipmentDetailsMap = (
  _savedAddresses?: UserAddress[] | UserAddress | null,
  userName?: string | null
): Record<string, any> => {
  const receiverName = userName || 'Kullanıcı';

  return {
    'mock-1': {
      id: 'mock-1',
      tracking_number: 'TY7382910482',
      title: 'Kablosuz Kulaklık & Koruma Kılıfı',
      current_status: 'out_for_delivery',
      sender: 'Trendyol Tech Mağazası',
      receiver: `${receiverName}\nTeslimat Adresi`,
      last_location: 'Dağıtım Şubesi',
      estimated_delivery: 'Bugün, 14:00 - 18:00',
      courier_companies: { name: 'Trendyol Express' },
      events: [
        { id: 'e1-1', title: 'Kurye Dağıtıma Çıktı', description: 'Kurye paketinizi teslim etmek üzere yola çıktı.', location: 'Dağıtım Şubesi', event_time: '2026-08-18T09:30:00Z', status: 'out_for_delivery' },
        { id: 'e1-2', title: 'Varış Dağıtım Merkezinde', description: 'Araçtan İndirildi, Dağıtıma Hazırlanıyor', location: 'Dağıtım Şubesi', event_time: '2026-08-18T06:15:00Z', status: 'destination' },
        { id: 'e1-3', title: 'Hat Aracında / Transfer Merkezinde', description: 'İzmir Transfer -> İstanbul Ana Dağıtım Merkezi', location: 'Gebze Transfer Merkezi, Kocaeli', event_time: '2026-08-17T21:40:00Z', status: 'transit' },
        { id: 'e1-4', title: 'Kargo Kabul Edildi', description: 'İzmir Alsancak Şubesi gönderiyi teslim aldı.', location: 'Alsancak Şube, İzmir', event_time: '2026-08-17T14:20:00Z', status: 'received' },
      ]
    },
    'mock-2': {
      id: 'mock-2',
      tracking_number: 'HJ9482019384',
      title: 'Mekanik Oyuncu Klavyesi',
      current_status: 'transit',
      sender: 'Hepsiburada Satıcısı',
      receiver: `${receiverName}\nTeslimat Adresi`,
      last_location: 'Bolu Geçiş Noktası Transfer Hattı',
      estimated_delivery: 'Yarın, 10:00 - 14:00',
      courier_companies: { name: 'Hepsijet' },
      events: [
        { id: 'e2-1', title: 'Transfer Aracında Yolda', description: 'Ankara Ana Merkezden Dağıtım Merkezine sevk halinde.', location: 'Bolu Geçiş Noktası Transfer Hattı', event_time: '2026-08-17T23:10:00Z', status: 'transit' },
        { id: 'e2-2', title: 'Çıkış Transfer Merkezinde', description: 'Ankara Lojistik Üssü çıkış barkodu okundu.', location: 'Kazan Transfer Merkezi, Ankara', event_time: '2026-08-17T18:00:00Z', status: 'transit' },
        { id: 'e2-3', title: 'Kargo Kabul Edildi', description: 'Gönderici adresinden kurye ile teslim alındı.', location: 'Çankaya Şube, Ankara', event_time: '2026-08-16T15:30:00Z', status: 'received' },
      ]
    },
    'mock-3': {
      id: 'mock-3',
      tracking_number: 'YK8473920194',
      title: 'Deri Sırt Çantası & Cüzdan',
      current_status: 'destination',
      sender: 'Derimod Online',
      receiver: `${receiverName}\nTeslimat Adresi`,
      last_location: 'Varış Şubesi',
      estimated_delivery: 'Bugün, 16:30\'a kadar',
      courier_companies: { name: 'Yurtiçi Kargo' },
      events: [
        { id: 'e3-1', title: 'Varış Dağıtım Merkezinde', description: 'Paket şubeye ulaştı, gün içi dağıtım planına eklendi.', location: 'Varış Şubesi', event_time: '2026-08-18T08:00:00Z', status: 'destination' },
        { id: 'e3-2', title: 'Transfer Merkezinden Çıktı', description: 'Bursa Nilüfer Transfer -> İstanbul Anadolu TM', location: 'Tuzla Transfer Merkezi, İstanbul', event_time: '2026-08-17T04:20:00Z', status: 'transit' },
        { id: 'e3-3', title: 'Kargo Kabul Edildi', description: 'Bursa Nilüfer Şubesinde kaydı açıldı.', location: 'Nilüfer Şube, Bursa', event_time: '2026-08-15T11:00:00Z', status: 'received' },
      ]
    },
    'mock-4': {
      id: 'mock-4',
      tracking_number: 'AR2948103947',
      title: 'Koşu Ayakkabısı (42 Numara)',
      current_status: 'delivered',
      sender: 'Nike Türkiye',
      receiver: `${receiverName}\nTeslim Edildi`,
      last_location: `Teslim Edildi - ${receiverName} (Kendisi)`,
      estimated_delivery: '14 Ağustos Cuma, 16:30 (Teslim Edildi)',
      courier_companies: { name: 'Aras Kargo' },
      events: [
        { id: 'e4-1', title: 'Teslim Edildi', description: `Gönderi alıcı ${receiverName} şahsına teslim edildi.`, location: 'Teslimat Adresi', event_time: '2026-08-14T16:30:00Z', status: 'delivered' },
        { id: 'e4-2', title: 'Kurye Dağıtıma Çıktı', description: 'Kurye dağıtım rotasında.', location: 'Dağıtım Şubesi', event_time: '2026-08-14T10:15:00Z', status: 'out_for_delivery' },
        { id: 'e4-3', title: 'Kargo Kabul Edildi', description: 'Çıkış Şubesi teslim aldı.', location: 'İkitelli Şube, İstanbul', event_time: '2026-08-13T09:00:00Z', status: 'received' },
      ]
    },
    'mock-5': {
      id: 'mock-5',
      tracking_number: 'SK1928374650',
      title: 'Yazılım & Tasarım Kitapları',
      current_status: 'created',
      sender: 'Kitapyurdu Dağıtım',
      receiver: `${receiverName}\nTeslimat Adresi`,
      last_location: 'Sipariş Hazırlanıyor, Barkod Oluşturuldu',
      estimated_delivery: '22 Ağustos Cuma, 18:00',
      courier_companies: { name: 'Sürat Kargo' },
      events: [
        { id: 'e5-1', title: 'Kayıt Oluşturuldu', description: 'Gönderici elektronik kargo fişi oluşturdu.', location: 'Ankara Lojistik Merkezi', event_time: '2026-08-18T11:00:00Z', status: 'created' }
      ]
    },
    'mock-6': {
      id: 'mock-6',
      tracking_number: 'KG8392019381',
      title: 'Filtre Kahve Çekirdeği 1KG',
      current_status: 'received',
      sender: 'Kronotrop Coffee Roasters',
      receiver: `${receiverName}\nTeslimat Adresi`,
      last_location: 'Maslak Şubesi, İstanbul',
      estimated_delivery: '20 Ağustos Çarşamba, 13:00',
      courier_companies: { name: 'Kargoist' },
      events: [
        { id: 'e6-1', title: 'Kargo Kabul Edildi', description: 'Kurye paket kabulünü onayladı.', location: 'Maslak Şubesi, İstanbul', event_time: '2026-08-17T17:45:00Z', status: 'received' }
      ]
    },
    'mock-7': {
      id: 'mock-7',
      tracking_number: 'DHL9382019283',
      title: 'Yurt Dışı Yazılım Geliştirici Kiti',
      current_status: 'transit',
      sender: 'GitHub Store US/EU',
      receiver: `${receiverName}\nTeslimat Adresi`,
      last_location: 'İstanbul Havalimanı Gümrük Noktası',
      estimated_delivery: '21 Ağustos Perşembe, 17:00',
      courier_companies: { name: 'DHL Express' },
      events: [
        { id: 'e7-1', title: 'Gümrük İşlemleri Tamamlandı', description: 'Uluslararası transit gümrük kontrolünden geçti.', location: 'İGA Kargo Terminali, İstanbul', event_time: '2026-08-17T02:00:00Z', status: 'transit' },
        { id: 'e7-2', title: 'Uluslararası Transfer', description: 'Frankfurt Hub -> İstanbul Uçuşu tamamlandı.', location: 'Frankfurt Hub, Almanya', event_time: '2026-08-16T12:00:00Z', status: 'transit' }
      ]
    },
    'mock-8': {
      id: 'mock-8',
      tracking_number: 'FDX0928374619',
      title: 'Akıllı Ev Sensör Paketi',
      current_status: 'delivered',
      sender: 'Philips Hue EU Store',
      receiver: `${receiverName}\nTeslim Edildi`,
      last_location: `Teslim Edildi - ${receiverName}`,
      estimated_delivery: '13 Ağustos Çarşamba, 14:10 (Teslim Edildi)',
      courier_companies: { name: 'FedEx' },
      events: [
        { id: 'e8-1', title: 'Teslim Edildi', description: 'Güvenlik görevlisine teslim edildi.', location: 'Teslimat Noktası', event_time: '2026-08-13T14:10:00Z', status: 'delivered' }
      ]
    }
  };
};
