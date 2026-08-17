import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { EditProfileModal } from './EditProfileModal';

interface PersonalInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PersonalInfoModal({ visible, onClose }: PersonalInfoModalProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { theme: colors } = useTheme();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const displayEmail = user?.email || 'E-posta bulunamadı';
  const displayPhone = profile?.phone || 'Henüz eklenmedi';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || 'https://i.pravatar.cc/300?img=11';

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        {/* TopAppBar */}
        <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
          <View style={styles.appBarContent}>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.appBarTitle, { color: colors.primary }]}>Kişisel Bilgiler</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.mainContent,
            { paddingBottom: isLargeScreen ? 48 : insets.bottom + 48 }
          ]}
        >
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.avatarBorderContainer, { borderColor: colors.surfaceContainerLowest }]}>
              <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
            </View>
            <Text style={[styles.profileName, { color: colors.onSurface }]}>{displayName}</Text>
            <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>{displayEmail}</Text>

            <TouchableOpacity
              style={[styles.editPillButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => setEditModalVisible(true)}
            >
              <MaterialIcons name="edit" size={16} color="#ffffff" />
              <Text style={styles.editPillButtonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>

          {/* Details Section Card */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainer }]}>
              <MaterialIcons name="badge" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Kullanıcı Detayları</Text>
            </View>

            <View style={styles.sectionBody}>
              {/* Ad Soyad */}
              <View style={[styles.detailRow, { borderBottomColor: 'rgba(197, 197, 211, 0.3)' }]}>
                <View style={styles.detailIconBg}>
                  <MaterialIcons name="person" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Ad Soyad</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>{displayName}</Text>
                </View>
              </View>

              {/* E-Posta */}
              <View style={[styles.detailRow, { borderBottomColor: 'rgba(197, 197, 211, 0.3)' }]}>
                <View style={styles.detailIconBg}>
                  <MaterialIcons name="email" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>E-Posta Adresi</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>{displayEmail}</Text>
                </View>
              </View>

              {/* Telefon Numarası */}
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.detailIconBg}>
                  <MaterialIcons name="phone" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Telefon Numarası</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>{displayPhone}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 40,
  },
  appBarContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    maxWidth: 896,
    alignSelf: 'center',
    width: '100%',
    gap: 20,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarBorderContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginBottom: 20,
  },
  editPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  editPillButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(197, 197, 211, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.3)',
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionBody: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
  },
  detailIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
});
