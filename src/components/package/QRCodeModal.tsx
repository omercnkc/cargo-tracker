import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { ExportUtils } from '../../utils/exportUtils';
import { useTheme } from '../../theme/useTheme';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  shipment: {
    tracking_number: string;
    title?: string;
    sender?: string;
    receiver?: string;
    current_status?: string;
  };
}

export function QRCodeModal({ visible, onClose, shipment }: QRCodeModalProps) {
  const { theme: colors } = useTheme();

  const handleExportPDF = async () => {
    await ExportUtils.exportShipmentToPDF(shipment);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Kargo QR Kodu & Etiketi</Text>
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
              <Text style={styles.pdfButtonText}>PDF Etiketi İndir / Paylaş</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  trackingText: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitleText: {
    fontSize: 14,
  },
  actionContainer: {
    marginTop: 20,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  pdfButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
