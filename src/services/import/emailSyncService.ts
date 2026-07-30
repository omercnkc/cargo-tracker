import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../notifications/notificationService';
import { shipmentRepository } from '../../features/shipment/repositories/shipment.repository';

const CONNECTED_EMAIL_KEY = '@cargo_tracker_connected_email';
const SYNCED_TRACKING_NUMBERS_KEY = '@cargo_tracker_synced_tracking_numbers';

export interface EmailScanResult {
  mailId: string;
  sender: string;
  subject: string;
  trackingNumber: string;
  courierCompany: string;
  itemTitle: string;
  foundAt: string;
}

// Otomatik kargo e-postası tetikleyici anahtar kelimeler
const SHIPPING_SUBJECT_KEYWORDS = [
  'paketiniz kargoya verildi',
  'kargonuz yola çıktı',
  'siparişiniz kargolandı',
  'teslimat başladı',
  'gönderiniz yolda',
  'kargoya teslim edildi',
];

const ECOMMERCE_SENDERS = [
  { domain: 'trendyol.com', name: 'Trendyol', defaultCompany: 'Trendyol Express' },
  { domain: 'hepsiburada.com', name: 'Hepsiburada', defaultCompany: 'HepsiJet' },
  { domain: 'amazon.com', name: 'Amazon', defaultCompany: 'Amazon Lojistik' },
  { domain: 'n11.com', name: 'N11', defaultCompany: 'Aras Kargo' },
  { domain: 'araskargo.com', name: 'Aras Kargo', defaultCompany: 'Aras Kargo' },
  { domain: 'yurticikargo.com', name: 'Yurtiçi Kargo', defaultCompany: 'Yurtiçi Kargo' },
  { domain: 'ptt.gov.tr', name: 'PTT Kargo', defaultCompany: 'PTT Kargo' },
];

export class EmailSyncService {
  /**
   * Bağlı e-posta adresini getirir
   */
  static async getConnectedEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CONNECTED_EMAIL_KEY);
    } catch {
      return null;
    }
  }

  /**
   * E-posta hesabını bağlar
   */
  static async connectEmail(email: string): Promise<boolean> {
    if (!email || !email.includes('@')) return false;
    await AsyncStorage.setItem(CONNECTED_EMAIL_KEY, email);
    return true;
  }

  /**
   * E-posta bağlantısını koparır ve taranmış kayıtları sıfırlar
   */
  static async disconnectEmail(): Promise<void> {
    await AsyncStorage.removeItem(CONNECTED_EMAIL_KEY);
    await AsyncStorage.removeItem(SYNCED_TRACKING_NUMBERS_KEY);
  }

  /**
   * Daha önce e-postadan taranıp eklenmiş takip numaralarını getirir
   */
  static async getSyncedTrackingNumbers(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(SYNCED_TRACKING_NUMBERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Taranmış yeni takip numarasını yerel önbelleğe kaydeder (Mükerrer eklemeyi önler)
   */
  static async saveSyncedTrackingNumber(trackingNumber: string): Promise<void> {
    try {
      const current = await this.getSyncedTrackingNumbers();
      if (!current.includes(trackingNumber)) {
        const updated = [...current, trackingNumber];
        await AsyncStorage.setItem(SYNCED_TRACKING_NUMBERS_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Taranmış takip no kaydedilemedi:', err);
    }
  }

  /**
   * E-posta başlığını ve içeriğini analiz ederek kargo takip numarasını çıkartır
   */
  static parseEmailHeaderAndBody(
    mailId: string,
    sender: string,
    subject: string,
    body: string
  ): EmailScanResult | null {
    const subjectLower = subject.toLowerCase();
    const isShippingMail = SHIPPING_SUBJECT_KEYWORDS.some((keyword) => subjectLower.includes(keyword));

    if (!isShippingMail) {
      return null;
    }

    // Gönderici firmayı tespit et
    const senderLower = sender.toLowerCase();
    const matchedPlatform = ECOMMERCE_SENDERS.find((p) => senderLower.includes(p.domain)) || {
      name: 'E-Ticaret Siparişi',
      defaultCompany: 'Genel Kargo',
    };

    // Metin içerisinden takip numarasını ayrıştır
    const combinedText = `${subject} ${body}`;

    // Regex kalıpları: TR-XXXXX, KPXXXX, 1ZXXXX veya 8-14 haneli numaralar
    const trackingMatch =
      combinedText.match(/TR-?\d{6,12}/i) ||
      combinedText.match(/KP\d{11,13}/i) ||
      combinedText.match(/1Z[A-Z0-9]{16}/i) ||
      combinedText.match(/\b\d{10,14}\b/);

    if (!trackingMatch) {
      return null;
    }

    const trackingNumber = trackingMatch[0].toUpperCase();

    return {
      mailId,
      sender: matchedPlatform.name,
      subject,
      trackingNumber,
      courierCompany: matchedPlatform.defaultCompany,
      itemTitle: `${matchedPlatform.name} Siparişiniz`,
      foundAt: new Date().toISOString(),
    };
  }

  /**
   * Bağlı e-posta hesabındaki yeni kargo e-postalarını taranmamışlar içerisinden bulur ve ekler
   */
  static async syncConnectedEmail(userId?: string): Promise<EmailScanResult[]> {
    const connectedEmail = await this.getConnectedEmail();
    if (!connectedEmail) return [];

    const alreadySyncedNumbers = await this.getSyncedTrackingNumbers();

    // Örnek simüle edilmiş e-posta gelen kutusu verileri (Trendyol ve Hepsiburada)
    const mockInboxMessages = [
      {
        id: 'mail_trendyol_101',
        sender: 'kargo@trendyol.com',
        subject: 'Paketiniz kargoya verildi! (Sipariş #948201)',
        body: 'Merhaba Ahmet Yılmaz, Trendyol siparişiniz Aras Kargo şirketine teslim edilmiştir. Takip numarası: TR-948201948',
      },
      {
        id: 'mail_hepsiburada_102',
        sender: 'siparis@hepsiburada.com',
        subject: 'Kargonuz yola çıktı - HepsiJet',
        body: 'Sayın Müşterimiz, Hepsiburada siparişiniz HepsiJet ile yola çıktı. Takip No: KP99281029381',
      },
    ];

    const newDetectedShipments: EmailScanResult[] = [];

    for (const mail of mockInboxMessages) {
      const parsed = this.parseEmailHeaderAndBody(mail.id, mail.sender, mail.subject, mail.body);
      
      // Eğer geçerli bir kargo e-postası ise VE daha önceden taranıp eklenmediyse
      if (parsed && !alreadySyncedNumbers.includes(parsed.trackingNumber)) {
        newDetectedShipments.push(parsed);

        // Mükerrerliği önlemek için takip numarasını taranmışlara kaydet
        await this.saveSyncedTrackingNumber(parsed.trackingNumber);

        // Kullanıcı ID varsa veritabanına otomatik kaydet
        if (userId) {
          await shipmentRepository.createShipment({
            user_id: userId,
            tracking_number: parsed.trackingNumber,
            title: parsed.itemTitle,
            current_status: 'transit',
          });
        }

        // Kullanıcıya anlık otomatik bildirim gönder
        await NotificationService.sendLocalNotification({
          title: `📧 Otomatik Kargo Eklendi (${parsed.sender})`,
          body: `E-postanızda tespit edilen ${parsed.trackingNumber} nolu kargo listenize eklendi!`,
          data: { trackingNumber: parsed.trackingNumber },
        });
      }
    }

    return newDetectedShipments;
  }
}
