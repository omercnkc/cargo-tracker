import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../store/auth.store';
import { useDrawerStore } from '../store/drawer.store';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { useNotificationStore } from '../store/notification.store';
import { UserAvatar } from '../components/common/UserAvatar';
import { ProfileThemeLangSwitchCard } from '../components/profile/ProfileThemeLangSwitchCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { hapticService } from '../services/haptics.service';
import { styles } from './ProfileScreen.styles';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const openDrawer = useDrawerStore((state) => state.openDrawer);

  const { theme: colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { data: dbShipments } = useShipments(user?.id);
  const unreadCount = useNotificationStore((state) => state.notifications.filter((n) => n.unread).length);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('account');
  const displayEmail = user?.email || '';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Dynamic stats calculation
  const totalCount = dbShipments ? dbShipments.length : 5;
  const inTransitCount = dbShipments ? dbShipments.filter(s => s.current_status === 'transit').length : 5;
  const deliveredCount = dbShipments ? dbShipments.filter(s => s.current_status === 'delivered').length : 0;
  const errorCount = 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isLargeScreen && { paddingLeft: 240 }]}>

      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.surfaceContainer }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            hapticService.buttonPress();
            openDrawer();
          }}>
            <MaterialIcons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('myProfile')}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            hapticService.buttonPress();
            navigation.navigate('Notifications');
          }}>
            <MaterialIcons name="notifications" size={24} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={[styles.redDot, { backgroundColor: colors.error }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
        ]}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>

          {/* User Avatar */}
          <UserAvatar
            avatarUrl={displayAvatar}
            name={displayName}
            email={displayEmail}
            size={96}
            borderWidth={3}
            borderColor={colors.surface}
            style={{ marginBottom: 16 }}
          />

          {/* User Details */}
          <Text style={[styles.profileName, { color: colors.onSurface }]}>{displayName}</Text>
          <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>{displayEmail}</Text>

          {/* Edit Profile Action Button */}
          <TouchableOpacity
            style={[styles.editPillButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => {
              hapticService.buttonPress();
              setEditModalVisible(true);
            }}
          >
            <MaterialIcons name="edit" size={16} color={colors.onPrimary} />
            <Text style={[styles.editPillButtonText, { color: colors.onPrimary }]}>{t('editProfile')}</Text>
          </TouchableOpacity>

        </View>

        {/* Dynamic Shipment Statistics Row */}
        <View style={[styles.statsCardRow, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>

          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.primaryContainer }]}>
              <MaterialIcons name="inventory" size={18} color={colors.onPrimaryContainer} />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>{t('totalCargo')}</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{totalCount}</Text>
          </View>

          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name="local-shipping" size={18} color={colors.onSecondaryContainer} />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>{t('inTransit')}</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{inTransitCount}</Text>
          </View>

          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.tertiaryContainer }]}>
              <MaterialIcons name="check-circle" size={18} color={colors.onTertiaryContainer} />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>{t('delivered')}</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{deliveredCount}</Text>
          </View>

          <View style={styles.statColItem}>
            <View style={[styles.statIconCircle, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fef2f2' }]}>
              <MaterialIcons name="error" size={18} color={isDarkMode ? '#fca5a5' : '#dc2626'} />
            </View>
            <Text style={[styles.statColLabel, { color: colors.onSurfaceVariant }]}>{t('issues')}</Text>
            <Text style={[styles.statColValue, { color: colors.onSurface }]}>{errorCount}</Text>
          </View>

        </View>

        {/* Theme & Language Switch Card */}
        <ProfileThemeLangSwitchCard />

      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />
    </View>
  );
};

export default ProfileScreen;
