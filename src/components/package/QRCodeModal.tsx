import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { styles } from './QRCodeModal.styles';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  shipment: {
    tracking_number: string;
    title?: string | null;
    courier_companies?: { name: string } | null;
  };
}

export function QRCodeModal({ visible, onClose, shipment }: QRCodeModalProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Kargo Etiketi</title>
            <style>
              body { font-family: Helvetica, Arial, sans-serif; padding: 40px; text-align: center; color: #1e293b; }
              .card { border: 2px solid #00236f; border-radius: 16px; padding: 30px; max-width: 400px; margin: 0 auto; }
              .brand { font-size: 24px; font-weight: bold; color: #00236f; margin-bottom: 20px; }
              .code { font-size: 28px; font-weight: bold; letter-spacing: 2px; margin-top: 15px; color: #2563eb; }
              .title { font-size: 16px; color: #64748b; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="brand">KargoTakip - Teslimat Etiketi</div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=cargo-tracker://package/${shipment.tracking_number}" width="180" height="180" />
              <div class="code">${shipment.tracking_number}</div>
              <div class="title">${shipment.title || shipment.courier_companies?.name || 'Kargo Paket Etiketi'}</div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Kargo Etiketini Paylaş' });
    } catch (error) {
      console.error('PDF alma hatası:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>{t('qrCodeModalTitle')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <QRCode
              value={`cargo-tracker://package/${shipment.tracking_number}`}
              size={180}
              color={colors.primary}
              backgroundColor="#ffffff"
            />
            <Text style={[styles.trackingText, { color: colors.onBackground }]}>
              {shipment.tracking_number}
            </Text>
            {shipment.title && (
              <Text style={[styles.subtitleText, { color: colors.onSurfaceVariant }]}>
                {shipment.title}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.pdfButton, { backgroundColor: colors.primary }]}
              onPress={handleExportPDF}
              activeOpacity={0.8}
            >
              <MaterialIcons name="picture-as-pdf" size={20} color="#ffffff" />
              <Text style={styles.pdfButtonText}>{t('downloadPdfBadge')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default QRCodeModal;
