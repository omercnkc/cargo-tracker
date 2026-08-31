import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ErrorHandler, AppErrorCode } from '../services/error/errorHandler.service';
import { formatDateDDMMYYYY } from './dateUtils';

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
   * Tek bir kargo için standart kargo etiketi PDF çıktısı oluşturur ve paylaşır
   */
  static async exportShipmentToPDF(shipment: ExportShipmentData): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; }
              .header { border-bottom: 2px solid #00236f; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
              .title { font-size: 20px; font-weight: bold; color: #00236f; }
              .badge { background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              .row { margin-bottom: 12px; font-size: 14px; }
              .label { font-weight: bold; color: #64748b; width: 120px; display: inline-block; }
              .barcode-box { margin-top: 30px; padding: 16px; border: 1px dashed #cbd5e1; text-align: center; border-radius: 8px; }
              .barcode-text { font-family: monospace; font-size: 18px; letter-spacing: 4px; font-weight: bold; margin-top: 8px; }
              .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">KARGO BİLGİ VE TAKİP FORMU</div>
              <div class="badge">${shipment.courier_company || 'Kargo'}</div>
            </div>

            <div class="row">
              <span class="label">Takip Numarası:</span> <strong>${shipment.tracking_number}</strong>
            </div>
            <div class="row">
              <span class="label">Başlık:</span> ${shipment.title || '-'}
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
              Bu belge KargoTakip Mobil Uygulaması tarafından ${formatDateDDMMYYYY(new Date())} tarihinde oluşturulmuştur.
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
      ErrorHandler.handleError(AppErrorCode.FILE_SYSTEM_ERROR, 'ExportUtils');
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
      `"${formatDateDDMMYYYY(s.created_at)}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }
}
