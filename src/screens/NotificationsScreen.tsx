import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const NOTIFICATIONS = [
  {
    id: '1',
    unread: true,
    icon: 'local-shipping',
    iconBg: colors.primaryContainer,
    iconColor: colors.onPrimaryContainer,
    time: '2 hours ago',
    title: 'MacBook Pro M3',
    description: 'Your package is Out for delivery and will arrive today by 8:00 PM.',
    trackingNumber: 'TR-982347102',
  },
  {
    id: '2',
    unread: true,
    icon: 'warehouse',
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.onSurface,
    time: 'Yesterday, 14:30',
    title: 'Office Supplies',
    description: 'Package arrived at local sorting facility in Istanbul.',
    trackingNumber: 'TR-551029384',
  },
  {
    id: '3',
    unread: false,
    icon: 'check-circle',
    iconBg: colors.tertiaryContainer,
    iconColor: colors.onTertiaryContainer,
    time: 'Oct 12, 2023',
    title: 'Winter Jacket',
    description: 'Delivered successfully. Left at front door.',
  },
  {
    id: '4',
    unread: false,
    icon: 'flight-takeoff',
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.onSurface,
    time: 'Oct 10, 2023',
    title: 'Mechanical Keyboard',
    description: 'Departed origin country facility (Shenzhen, CN).',
  }
];

export const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="menu" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>KargoTakip</Text>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="add" size={24} color={colors.primary} />
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
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Notifications</Text>
          <TouchableOpacity>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationList}>
          {NOTIFICATIONS.map(notification => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationCard,
                !notification.unread && styles.notificationCardRead
              ]}
              activeOpacity={0.7}
            >
              {notification.unread && (
                <View style={styles.unreadIndicator} />
              )}
              
              <View style={styles.notificationContent}>
                <View style={[styles.iconContainer, { backgroundColor: notification.iconBg }]}>
                  <MaterialIcons name={notification.icon as any} size={20} color={notification.iconColor} />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.timeText}>{notification.time}</Text>
                  <Text style={styles.titleText}>{notification.title}</Text>
                  
                  {/* Highlight specific words if needed, based on the mockup string, doing a simple render */}
                  <Text style={styles.descriptionText}>
                    {notification.description}
                  </Text>
                  
                  {notification.trackingNumber && (
                    <Text style={styles.trackingText}>{notification.trackingNumber}</Text>
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
    backgroundColor: colors.background,
  },
  appBar: {
    backgroundColor: colors.surface,
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
    color: colors.primary,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 896, // max-w-4xl
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: 'Inter',
    fontSize: 24, // headline-lg-mobile
    fontWeight: '700',
    color: colors.onSurface,
  },
  markReadText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  notificationList: {
    gap: 16,
  },
  notificationCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  notificationCardRead: {
    opacity: 0.75,
    shadowOpacity: 0,
    elevation: 0,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryContainer,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16, // space for unread dot
  },
  timeText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 4,
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
  trackingText: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: colors.outline,
    marginTop: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant + '4D',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: 999,
  },
  navText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimaryContainer,
    marginTop: 4,
  },
});

export default NotificationsScreen;
