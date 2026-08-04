import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../notifications/notificationService';
import { shipmentRepository } from '../../features/shipment/repositories/shipment.repository';
import { GoogleAuthService, GoogleUserProfile } from './googleAuthService';
import { GmailApiService } from './gmailApiService';

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

export class EmailSyncService {
  /**
   * Bağlı e-posta adresini getirir (Önce Google profilini kontrol eder)
   */
  static async getConnectedEmail(): Promise<string | null> {
    try {
      const googleUser = await GoogleAuthService.getUserProfile();
      if (googleUser?.email) return googleUser.email;
      return await AsyncStorage.getItem(CONNECTED_EMAIL_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Bağlı olan Google profil detaylarını döner
   */
  static async getGoogleProfile(): Promise<GoogleUserProfile | null> {
    return await GoogleAuthService.getUserProfile();
  }

  /**
   * Manuel E-posta kaydeder
   */
  static async connectEmail(email: string): Promise<boolean> {
    if (!email || !email.includes('@')) return false;
    await AsyncStorage.setItem(CONNECTED_EMAIL_KEY, email);
    return true;
  }

  /**
   * E-posta bağlantısını koparır ve taranmış kayıtları temizler
   */
  static async disconnectEmail(): Promise<void> {
    await GoogleAuthService.disconnect();
    await AsyncStorage.removeItem(CONNECTED_EMAIL_KEY);
    await AsyncStorage.removeItem(SYNCED_TRACKING_NUMBERS_KEY);
  }

  /**
   * Daha önce taranıp eklenmiş kargo takip numaralarını getirir
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
   * Taranmış yeni takip numarasını yerel hafızaya kaydeder
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
   * Bağlı e-posta hesabından (Canlı Gmail API veya yedek tarayıcı) yeni kargoları çeker
   */
  static async syncConnectedEmail(userId?: string): Promise<EmailScanResult[]> {
    const connectedEmail = await this.getConnectedEmail();
    if (!connectedEmail) return [];

    const alreadySyncedNumbers = await this.getSyncedTrackingNumbers();
    const accessToken = await GoogleAuthService.getAccessToken();

    let detectedMails: EmailScanResult[] = [];

    // 1. Canlı Google Access Token varsa doğrudan Gmail API'den gerçek mailleri tara
    if (accessToken) {
      detectedMails = await GmailApiService.fetchShippingEmails(accessToken);
    }


    const newDetectedShipments: EmailScanResult[] = [];

    for (const mail of detectedMails) {
      // Eğer daha önce eklenmemiş bir takip numarası ise
      if (!alreadySyncedNumbers.includes(mail.trackingNumber)) {
        newDetectedShipments.push(mail);

        // Mükerrerliği önlemek için hafızaya al
        await this.saveSyncedTrackingNumber(mail.trackingNumber);

        // Veritabanına otomatik ekle
        if (userId) {
          await shipmentRepository.createShipment({
            user_id: userId,
            tracking_number: mail.trackingNumber,
            title: mail.itemTitle,
            current_status: 'transit',
          });
        }

        // Bildirim gönder
        await NotificationService.sendLocalNotification({
          title: `📧 Otomatik Kargo Tespiti (${mail.sender})`,
          body: `${mail.trackingNumber} nolu kargonuz e-postanızdan tespit edilip listenize eklendi!`,
          data: { trackingNumber: mail.trackingNumber },
        });
      }
    }

    return newDetectedShipments;
  }
}
