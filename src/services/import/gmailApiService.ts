import { EmailScanResult } from './emailSyncService';

const ECOMMERCE_PLATFORMS = [
  { domain: 'trendyol', name: 'Trendyol', defaultCompany: 'Trendyol Express' },
  { domain: 'hepsiburada', name: 'Hepsiburada', defaultCompany: 'HepsiJet' },
  { domain: 'amazon', name: 'Amazon', defaultCompany: 'Amazon Lojistik' },
  { domain: 'n11', name: 'N11', defaultCompany: 'Aras Kargo' },
  { domain: 'ciceksepeti', name: 'Çiçeksepeti', defaultCompany: 'Genel Kargo' },
  { domain: 'aras', name: 'Aras Kargo', defaultCompany: 'Aras Kargo' },
  { domain: 'yurtici', name: 'Yurtiçi Kargo', defaultCompany: 'Yurtiçi Kargo' },
  { domain: 'mng', name: 'MNG Kargo', defaultCompany: 'MNG Kargo' },
  { domain: 'sendeo', name: 'Sendeo Kargo', defaultCompany: 'Sendeo' },
  { domain: 'ptt', name: 'PTT Kargo', defaultCompany: 'PTT Kargo' },
];

export class GmailApiService {
  /**
   * Gmail kutusunda kargo ile ilgili son e-postaları arar ve detaylarını döner
   */
  static async fetchShippingEmails(accessToken: string): Promise<EmailScanResult[]> {
    try {
      // 1. Kargo maillerini sorgula
      const query = encodeURIComponent('subject:(kargo OR sipariş OR kargolandı OR teslimat OR "yola çıktı" OR "teslim edildi")');
      const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=15`;

      const listResponse = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!listResponse.ok) {
        console.warn('Gmail API message list failed:', listResponse.status);
        return [];
      }

      const listData = await listResponse.json();
      const messages: { id: string; threadId: string }[] = listData.messages || [];

      if (messages.length === 0) {
        return [];
      }

      const results: EmailScanResult[] = [];

      // 2. Bulunan mesajların detaylarını tek tek çek
      for (const msg of messages) {
        try {
          const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
          const detailRes = await fetch(detailUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!detailRes.ok) continue;

          const mailDetail = await detailRes.json();
          const parsed = this.parseGmailMessage(mailDetail);
          if (parsed) {
            results.push(parsed);
          }
        } catch (err) {
          console.error(`Gmail msg ${msg.id} parse error:`, err);
        }
      }

      return results;
    } catch (err) {
      console.error('Gmail API fetch error:', err);
      return [];
    }
  }

  /**
   * Gmail API mesaj nesnesini analiz ederek kargo bilgilerini çıkartır
   */
  private static parseGmailMessage(mail: any): EmailScanResult | null {
    if (!mail || !mail.payload) return null;

    const headers: { name: string; value: string }[] = mail.payload.headers || [];

    const getHeader = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject');
    const sender = getHeader('From');
    const snippet = mail.snippet || '';

    // E-posta metnini oluştur
    let fullText = `${subject} ${snippet}`;

    // Eğer payload parçaları varsa plain text metin ekle
    if (mail.payload.parts) {
      for (const part of mail.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          try {
            const decoded = this.base64UrlDecode(part.body.data);
            fullText += ` ${decoded}`;
          } catch {}
        }
      }
    }

    // Tracking numarası regex analizi
    const trackingMatch =
      fullText.match(/TR-?\d{6,12}/i) ||
      fullText.match(/KP\d{11,13}/i) ||
      fullText.match(/1Z[A-Z0-9]{16}/i) ||
      fullText.match(/\b\d{10,14}\b/);

    if (!trackingMatch) {
      return null;
    }

    const trackingNumber = trackingMatch[0].toUpperCase();

    // Gönderici platformu tespit et
    const senderLower = sender.toLowerCase();
    const matchedPlatform = ECOMMERCE_PLATFORMS.find((p) => senderLower.includes(p.domain)) || {
      name: 'E-Ticaret Siparişi',
      defaultCompany: 'Kargo',
    };

    return {
      mailId: mail.id,
      sender: matchedPlatform.name,
      subject: subject || 'Kargo Bildirimi',
      trackingNumber,
      courierCompany: matchedPlatform.defaultCompany,
      itemTitle: `${matchedPlatform.name} Siparişiniz`,
      foundAt: new Date().toISOString(),
    };
  }

  /**
   * Gmail base64url kodlamasını çözer
   */
  private static base64UrlDecode(input: string): string {
    try {
      let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return decodeURIComponent(
        escape(atob(base64))
      );
    } catch {
      return '';
    }
  }
}
