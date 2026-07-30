import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface ExportShipmentData {
  tracking_number: string;
  title?: string;
  sender?: string;
  receiver?: string;
  current_status?: string;
  courier_company?: string;
  created_at?: string;
}

export class ExportUtils {
  /**
   * Kargo detaylarını PDF etiketi/belgesi olarak yazdırır veya paylaşır
   */
  static async exportShipmentToPDF(shipment: ExportShipmentData): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Kargo Etiketi - ${shipment.tracking_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
              .header { border-bottom: 2px solid #00236f; padding-bottom: 12px; margin-bottom: 20px; }
              .title { font-size: 24px; color: #00236f; font-weight: bold; }
              .tracking { font-size: 28px; font-family: monospace; letter-spacing: 2px; color: #2563eb; margin: 16px 0; }
              .badge { display: inline-block; padding: 6px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 12px; font-weight: bold; }
              .row { margin-bottom: 12px; font-size: 16px; }
              .label { color: #64748b; font-weight: bold; width: 120px; display: inline-block; }
              .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">📦 KARGO TAKİP FİŞİ & ETİKETİ</div>
            </div>
            
            <div class="tracking">${shipment.tracking_number}</div>
            
            <div class="row">
              <span class="label">Kargo Başlığı:</span> ${shipment.title || 'Belirtilmemiş'}
            </div>
            <div class="row">
              <span class="label">Kargo Firması:</span> ${shipment.courier_company || 'Genel'}
            </div>
            <div class="row">
              <span class="label">Gönderici:</span> ${shipment.sender || '-'}
            </div>
            <div class="row">
              <span class="label">Alıcı:</span> ${shipment.receiver || '-'}
            </div>
            <div class="row">
              <span class="label">Güncel Durum:</span> <span class="badge">${shipment.current_status || 'İşlemde'}</span>
            </div>

            <div class="footer">
              Bu belge KargoTakip Mobil Uygulaması tarafından ${new Date().toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Kargo Etiketi - ${shipment.tracking_number}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error('PDF dışa aktarma hatası:', error);
    }
  }

  /**
   * Kargo geçmişi listesini CSV formatında aktarır
   */
  static async exportShipmentsToCSV(shipments: ExportShipmentData[]): Promise<string> {
    const headers = ['Takip No', 'Başlık', 'Kargo Firması', 'Gönderici', 'Alıcı', 'Durum', 'Tarih'];
    const rows = shipments.map((s) => [
      `"${s.tracking_number || ''}"`,
      `"${s.title || ''}"`,
      `"${s.courier_company || ''}"`,
      `"${s.sender || ''}"`,
      `"${s.receiver || ''}"`,
      `"${s.current_status || ''}"`,
      `"${s.created_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }
}
