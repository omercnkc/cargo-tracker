import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../notifications/notificationService';

const CONNECTED_EMAIL_KEY = '@cargo_tracker_connected_email';
const SYNCED_MAIL_IDS_KEY = '@cargo_tracker_synced_mail_ids';

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
   * E-posta bağlantısını koparır
   */
  static async disconnectEmail(): Promise<void> {
    await AsyncStorage.removeItem(CONNECTED_EMAIL_KEY);
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
   * Bağlı e-posta hesabındaki yeni kargo e-postalarını simüle ederek tarar ve ekler
   */
  static async syncConnectedEmail(): Promise<EmailScanResult[]> {
    const connectedEmail = await this.getConnectedEmail();
    if (!connectedEmail) return [];

    // Örnek simüle edilmiş e-posta verileri (Trendyol, Hepsiburada, Amazon)
    const mockInboxMessages = [
      {
        id: `mail_${Date.now()}_1`,
        sender: 'kargo@trendyol.com',
        subject: 'Paketiniz kargoya verildi! (Sipariş #948201)',
        body: 'Merhaba Ahmet Yılmaz, Trendyol siparişiniz Aras Kargo şirketine teslim edilmiştir. Takip numarası: TR-948201948',
      },
      {
        id: `mail_${Date.now()}_2`,
        sender: 'siparis@hepsiburada.com',
        subject: 'Kargonuz yola çıktı - HepsiJet',
        body: 'Sayın Müşterimiz, Hepsiburada siparişiniz HepsiJet ile yola çıktı. Takip No: KP99281029381',
      },
    ];

    const detectedShipments: EmailScanResult[] = [];

    for (const mail of mockInboxMessages) {
      const parsed = this.parseEmailHeaderAndBody(mail.id, mail.sender, mail.subject, mail.body);
      if (parsed) {
        detectedShipments.push(parsed);

        // Kullanıcıya anlık otomatik kargo eklendi bildirimi gönder
        await NotificationService.sendLocalNotification({
          title: `📧 Otomatik Kargo Eklendi (${parsed.sender})`,
          body: `E-postanızda tespit edilen ${parsed.trackingNumber} nolu kargo listenize eklendi!`,
          data: { trackingNumber: parsed.trackingNumber },
        });
      }
    }

    return detectedShipments;
  }
}
