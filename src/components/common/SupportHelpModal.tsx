import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';

export type SupportModalType = 'help' | 'rate' | 'feedback' | 'privacy' | 'terms';

interface SupportHelpModalProps {
  visible: boolean;
  type: SupportModalType;
  onClose: () => void;
}

export function SupportHelpModal({ visible, type, onClose }: SupportHelpModalProps) {
  const { theme: colors } = useTheme();

  const getModalConfig = () => {
    switch (type) {
      case 'help':
        return {
          icon: 'help-outline',
          title: 'Yardım Merkezi & SSS',
          content: (
            <View style={styles.contentGroup}>
              <Text style={styles.qText}>❓ Kargomu nasıl takip edebilirim?</Text>
              <Text style={styles.aText}>Ana sayfadaki + butonuna basarak takip numaranızı girebilir, QR kod tarayıcıyı kullanabilir veya E-Posta bağlama özelliğinden faydalanabilirsiniz.</Text>
              
              <Text style={styles.qText}>❓ 15 dakikalık kargocu güvenlik gecikmesi nedir?</Text>
              <Text style={styles.aText}>Kuryelerin kişisel güvenliğini korumak amacıyla canlı haritada kargo aracı konumu 15 dakika gecikmeli olarak gösterilir.</Text>
              
              <Text style={styles.qText}>📞 Müşteri Destek Hattı</Text>
              <Text style={styles.aText}>7/24 Destek Ekibimize destek@kargotakip.com e-posta adresinden ulaşabilirsiniz.</Text>
            </View>
          ),
        };
      case 'privacy':
        return {
          icon: 'shield',
          title: 'Gizlilik Politikası',
          content: (
            <View style={styles.contentGroup}>
              <Text style={styles.aText}>KargoTakip olarak kişisel verilerinizin güvenliğine yüksek önem veriyoruz.</Text>
              <Text style={styles.qText}>🔒 Veri Şifreleme</Text>
              <Text style={styles.aText}>Tüm kargo verileriniz Supabase SSL/TLS 256-bit şifreleme altyapısında saklanır.</Text>
              <Text style={styles.qText}>📧 E-Posta Taraması</Text>
              <Text style={styles.aText}>Bağlı e-postalarınızda yalnızca kargo onay başlıkları taranır, kişisel içerikler saklanmaz veya üçüncü taraflarla paylaşılmaz.</Text>
            </View>
          ),
        };
      case 'terms':
        return {
          icon: 'description',
          title: 'Kullanım Koşulları',
          content: (
            <View style={styles.contentGroup}>
              <Text style={styles.aText}>KargoTakip uygulamasını kullanarak aşağıdaki şartları kabul etmiş olursunuz:</Text>
              <Text style={styles.qText}>1. Hizmet Kapsamı</Text>
              <Text style={styles.aText}>Uygulama, Türkiye içi ve uluslararası kargo verilerini sağlayıcı apiler üzerinden takip etmek üzere sunulmaktadır.</Text>
              <Text style={styles.qText}>2. Sorumluluk Sınırı</Text>
              <Text style={styles.aText}>Kargo şirketlerinin veri gecikmelerinden uygulamamız sorumlu tutulamaz.</Text>
            </View>
          ),
        };
      case 'feedback':
        return {
          icon: 'chat-bubble-outline',
          title: 'Geri Bildirim Gönder',
          content: (
            <View style={styles.contentGroup}>
              <Text style={styles.aText}>Görüş ve önerileriniz uygulamamızı geliştirmemiz için çok değerlidir!</Text>
              <TouchableOpacity style={styles.actionPillBtn} onPress={() => { Alert.alert('Teşekkürler', 'Geri bildiriminiz başarıyla iletildi.'); onClose(); }}>
                <MaterialIcons name="send" size={18} color="#ffffff" />
                <Text style={styles.actionPillText}>Geri Bildirim Formunu Gönder</Text>
              </TouchableOpacity>
            </View>
          ),
        };
      default:
        return {
          icon: 'star-outline',
          title: 'Uygulamayı Puanla',
          content: (
            <View style={styles.contentGroup}>
              <Text style={styles.aText}>KargoTakip deneyiminizi 5 yıldızla değerlendirmek ister misiniz?</Text>
              <TouchableOpacity style={styles.actionPillBtn} onPress={() => { Alert.alert('🎉 Harika!', '5 yıldız verdiğiniz için çok teşekkür ederiz!'); onClose(); }}>
                <MaterialIcons name="star" size={20} color="#f59e0b" />
                <Text style={styles.actionPillText}>App Store / Google Play'de Puanla</Text>
              </TouchableOpacity>
            </View>
          ),
        };
    }
  };

  const config = getModalConfig();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialIcons name={config.icon as any} size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.primary }]}>{config.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {config.content}
          </ScrollView>
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
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  contentGroup: {
    gap: 12,
  },
  qText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00236f',
    marginTop: 4,
  },
  aText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00236f',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  actionPillText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
