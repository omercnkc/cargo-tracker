import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../store/auth.store';
import { EditProfileModal } from './EditProfileModal';
import { styles } from './PersonalInfoModal.styles';

interface PersonalInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PersonalInfoModal({ visible, onClose }: PersonalInfoModalProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('account');
  const displayEmail = user?.email || t('notAddedYet');
  const displayPhone = profile?.phone || t('notAddedYet');
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
            <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('personalInfo')}</Text>
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
              <Text style={styles.editPillButtonText}>{t('editProfile')}</Text>
            </TouchableOpacity>
          </View>

          {/* Details Section Card */}
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainer }]}>
              <MaterialIcons name="badge" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('userDetails')}</Text>
            </View>

            <View style={styles.sectionBody}>
              {/* Ad Soyad */}
              <View style={[styles.detailRow, { borderBottomColor: 'rgba(197, 197, 211, 0.3)' }]}>
                <View style={styles.detailIconBg}>
                  <MaterialIcons name="person" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>{t('fullNameLabel')}</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>{displayName}</Text>
                </View>
              </View>

              {/* E-Posta */}
              <View style={[styles.detailRow, { borderBottomColor: 'rgba(197, 197, 211, 0.3)' }]}>
                <View style={styles.detailIconBg}>
                  <MaterialIcons name="email" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>{t('emailAddressLabel')}</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>{displayEmail}</Text>
                </View>
              </View>

              {/* Telefon Numarası */}
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.detailIconBg}>
                  <MaterialIcons name="phone" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>{t('phoneNumberLabel')}</Text>
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

export default PersonalInfoModal;
