import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';

interface NotificationItem {
  id: string;
  type: 'delivered' | 'in_transit' | 'hub' | 'received' | 'reminder' | 'failed';
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const getInitialNotifications = (t: any): NotificationItem[] => [
  {
    id: '1',
    type: 'delivered',
    title: t('notifDeliveredTitle'),
    description: t('notifDeliveredDesc'),
    time: '10:30',
    unread: true,
  },
  {
    id: '2',
    type: 'in_transit',
    title: t('notifInTransitTitle'),
    description: t('notifInTransitDesc'),
    time: '09:15',
    unread: true,
  },
  {
    id: '3',
    type: 'hub',
    title: t('notifHubTitle'),
    description: t('notifHubDesc'),
    time: t('timeYesterday'),
    unread: true,
  },
  {
    id: '4',
    type: 'received',
    title: t('notifReceivedTitle'),
    description: t('notifReceivedDesc'),
    time: t('timeYesterday'),
    unread: false,
  },
  {
    id: '5',
    type: 'reminder',
    title: t('notifReminderTitle'),
    description: t('notifReminderDesc'),
    time: t('timeDaysAgo'),
    unread: false,
  },
  {
    id: '6',
    type: 'failed',
    title: t('notifFailedTitle'),
    description: t('notifFailedDesc'),
    time: t('timeDaysAgo'),
    unread: false,
  },
];

export const NotificationsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getInitialNotifications(t));

  const toggleUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(item => item.id === id ? { ...item, unread: !item.unread } : item)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })));
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'delivered':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#E8F2FF' }]}>
            <MaterialCommunityIcons name="package-variant-closed" size={24} color="#2563EB" />
            <View style={[styles.miniCheckBadge, { backgroundColor: '#2563EB' }]}>
              <MaterialIcons name="check" size={10} color="#FFFFFF" />
            </View>
          </View>
        );
      case 'in_transit':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
            <MaterialIcons name="local-shipping" size={24} color="#D97706" />
          </View>
        );
      case 'hub':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
            <MaterialIcons name="store-mall-directory" size={24} color="#475569" />
          </View>
        );
      case 'received':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
            <MaterialIcons name="inventory" size={24} color="#16A34A" />
          </View>
        );
      case 'reminder':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
            <MaterialIcons name="notifications-active" size={24} color="#9333EA" />
          </View>
        );
      case 'failed':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}>
            <MaterialIcons name="warning" size={24} color="#DC2626" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
            <MaterialIcons name="notifications" size={24} color="#475569" />
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
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>{t('notificationsTitle')}</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markReadText, { color: colors.primary }]}>{t('markAllAsRead')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationList}>
          {notifications.map(notification => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationCard,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.outlineVariant || '#E2E8F0',
                },
              ]}
              onPress={() => toggleUnread(notification.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardMainRow}>
                {renderIcon(notification.type)}
                
                <View style={styles.textContainer}>
                  <Text style={[styles.titleText, { color: colors.onSurface }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.descriptionText, { color: colors.onSurfaceVariant || '#64748B' }]}>
                    {notification.description}
                  </Text>
                </View>

                <View style={styles.rightActionColumn}>
                  <Text style={styles.timeText}>{notification.time}</Text>
                  {notification.unread && (
                    <View style={styles.unreadBlueDot} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

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
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
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
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 896,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
  },
  markReadText: {
    fontFamily: 'Inter',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  notificationList: {
    gap: 12,
  },
  notificationCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 14,
  },
  miniCheckBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontSize: 13.5,
    lineHeight: 19,
  },
  rightActionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  timeText: {
    fontFamily: 'Inter',
    fontSize: 12.5,
    color: '#94A3B8',
  },
  unreadBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 10,
  },
});

export default NotificationsScreen;

