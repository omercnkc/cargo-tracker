import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  useWindowDimensions,
  Alert
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useNotificationStore, NotificationItem, NotificationFilter } from '../store/notification.store';
import styles from './NotificationsScreen.styles';

export const NotificationsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { theme: colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const notifications = useNotificationStore(state => state.notifications);
  const filter = useNotificationStore(state => state.filter);
  const setFilter = useNotificationStore(state => state.setFilter);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const deleteNotification = useNotificationStore(state => state.deleteNotification);
  const clearAllNotifications = useNotificationStore(state => state.clearAllNotifications);

  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => n.unread);
    }
    return notifications;
  }, [notifications, filter]);

  const handleItemPress = (item: NotificationItem) => {
    // Okundu olarak işaretle
    if (item.unread) {
      markAsRead(item.id);
    }
    // İlgili pakete git (varsa)
    if (item.packageId) {
      (navigation as any).navigate('PackageDetail', { id: item.packageId });
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      t('clearAllNotifsTitle'),
      t('clearAllNotifsConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => clearAllNotifications(),
        },
      ]
    );
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'delivered':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#1e3a8a' : '#E8F2FF' }]}>
            <MaterialCommunityIcons name="package-variant-closed" size={24} color={isDarkMode ? '#93c5fd' : '#2563EB'} />
            <View style={[styles.miniCheckBadge, { backgroundColor: '#2563EB' }]}>
              <MaterialIcons name="check" size={10} color="#FFFFFF" />
            </View>
          </View>
        );
      case 'in_transit':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#451a03' : '#FEF3C7' }]}>
            <MaterialIcons name="local-shipping" size={24} color={isDarkMode ? '#fde68a' : '#D97706'} />
          </View>
        );
      case 'hub':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#1f2937' : '#F1F5F9' }]}>
            <MaterialIcons name="store-mall-directory" size={24} color={isDarkMode ? '#9ca3af' : '#475569'} />
          </View>
        );
      case 'received':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#064e3b' : '#DCFCE7' }]}>
            <MaterialIcons name="inventory" size={24} color={isDarkMode ? '#6ee7b7' : '#16A34A'} />
          </View>
        );
      case 'reminder':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#581c87' : '#F3E8FF' }]}>
            <MaterialIcons name="notifications-active" size={24} color={isDarkMode ? '#d8b4fe' : '#9333EA'} />
          </View>
        );
      case 'failed':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#7f1d1d' : '#FEE2E2' }]}>
            <MaterialIcons name="warning" size={24} color={isDarkMode ? '#fca5a5' : '#DC2626'} />
          </View>
        );
      default:
        return (
          <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#1f2937' : '#F1F5F9' }]}>
            <MaterialIcons name="notifications" size={24} color={isDarkMode ? '#9ca3af' : '#475569'} />
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('notificationsTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
        ]}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.primary }]}>{t('notificationsTitle')}</Text>
          
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={[styles.actionText, { color: colors.primary }]}>{t('markAllAsRead')}</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={[styles.actionText, { color: colors.error }]}>{t('clearAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'all'
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, { color: filter === 'all' ? colors.onPrimary : colors.onSurface }]}>
              {t('allFilter')}
            </Text>
            <View style={[
              styles.tabBadge,
              { backgroundColor: filter === 'all' ? colors.onPrimary + '30' : colors.surfaceContainer }
            ]}>
              <Text style={[styles.tabBadgeText, { color: filter === 'all' ? colors.onPrimary : colors.onSurfaceVariant }]}>
                {notifications.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'unread'
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterTabText, { color: filter === 'unread' ? colors.onPrimary : colors.onSurface }]}>
              {t('unreadFilter')}
            </Text>
            {unreadCount > 0 && (
              <View style={[
                styles.tabBadge,
                { backgroundColor: filter === 'unread' ? colors.onPrimary + '30' : colors.error }
              ]}>
                <Text style={[styles.tabBadgeText, { color: '#ffffff' }]}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-off" size={48} color={colors.outlineVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
              {filter === 'unread' ? t('unreadEmptyTitle') : t('noNotifications')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
              {filter === 'unread'
                ? t('unreadEmptySubtitle')
                : t('noNotificationsSub')}
            </Text>
          </View>
        ) : (
          <View style={styles.notificationList}>
            {filteredNotifications.map(notification => (
              <TouchableOpacity 
                key={notification.id} 
                style={[
                  styles.notificationCard,
                  { 
                    backgroundColor: notification.unread 
                      ? (isDarkMode ? '#1e293b' : '#F8FAFC')
                      : colors.surface,
                    borderColor: notification.unread 
                      ? colors.primary 
                      : (colors.outlineVariant || '#E2E8F0'),
                  },
                ]}
                onPress={() => handleItemPress(notification)}
                activeOpacity={0.7}
              >
                {notification.unread && (
                  <View style={[styles.unreadStrip, { backgroundColor: colors.primary }]} />
                )}

                <View style={styles.cardMainRow}>
                  {renderIcon(notification.type)}
                  
                  <View style={styles.textContainer}>
                    <Text style={[
                      styles.titleText, 
                      { color: colors.onSurface },
                      notification.unread && { fontWeight: '700' }
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={[
                      styles.descriptionText, 
                      { color: colors.onSurfaceVariant || '#64748B' }
                    ]}>
                      {notification.description}
                    </Text>
                  </View>

                  <View style={styles.rightActionColumn}>
                    <Text style={[styles.timeText, { color: notification.unread ? colors.primary : '#94A3B8', fontWeight: notification.unread ? '600' : '400' }]}>
                      {notification.time}
                    </Text>

                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons name="close" size={16} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
