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
import { useTheme } from '../theme/useTheme';

const NOTIFICATIONS = [
  {
    id: '1',
    unread: true,
    icon: 'local-shipping',
    time: '2 saat önce',
    title: 'MacBook Pro M3',
    description: 'Paketiniz dağıtımda, bugün saat 20:00\'e kadar teslim edilecek.',
    trackingNumber: 'TR-982347102',
  },
  {
    id: '2',
    unread: true,
    icon: 'warehouse',
    time: 'Dün, 14:30',
    title: 'Ofis Malzemeleri',
    description: 'Paket İstanbul\'daki yerel dağıtım merkezine ulaştı.',
    trackingNumber: 'TR-551029384',
  },
  {
    id: '3',
    unread: false,
    icon: 'check-circle',
    time: 'Eki 12, 2023',
    title: 'Kış Montu',
    description: 'Başarıyla teslim edildi. Ön kapıya bırakıldı.',
  },
  {
    id: '4',
    unread: false,
    icon: 'flight-takeoff',
    time: 'Eki 10, 2023',
    title: 'Mekanik Klavye',
    description: 'Çıkış ülkesi tesisinden ayrıldı (Shenzhen, CN).',
  }
];

export const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { theme: colors } = useTheme();

  const getIconBg = (icon: string) => {
    if (icon === 'check-circle') return colors.tertiaryContainer;
    if (icon === 'local-shipping') return colors.primaryContainer;
    return colors.surfaceContainerHigh;
  };

  const getIconColor = (icon: string) => {
    if (icon === 'check-circle') return colors.onTertiaryContainer;
    if (icon === 'local-shipping') return colors.onPrimaryContainer;
    return colors.onSurface;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="menu" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>KargoTakip</Text>
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
          <Text style={[styles.pageTitle, { color: colors.onSurface }]}>Bildirimler</Text>
          <TouchableOpacity>
            <Text style={[styles.markReadText, { color: colors.primary }]}>Tümünü okundu işaretle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationList}>
          {NOTIFICATIONS.map(notification => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationCard,
                { 
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
                !notification.unread && styles.notificationCardRead
              ]}
              activeOpacity={0.7}
            >
              {notification.unread && (
                <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
              )}
              
              <View style={styles.notificationContent}>
                <View style={[styles.iconContainer, { backgroundColor: getIconBg(notification.icon) }]}>
                  <MaterialIcons name={notification.icon as any} size={20} color={getIconColor(notification.icon)} />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>{notification.time}</Text>
                  <Text style={[styles.titleText, { color: colors.onSurface }]}>{notification.title}</Text>
                  
                  <Text style={[styles.descriptionText, { color: colors.onSurface }]}>
                    {notification.description}
                  </Text>
                  
                  {notification.trackingNumber && (
                    <Text style={[styles.trackingText, { color: colors.outline }]}>{notification.trackingNumber}</Text>
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
    marginBottom: 24,
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
    gap: 16,
  },
  notificationCard: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
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
    paddingRight: 16,
  },
  timeText: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
  },
  trackingText: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 8,
  },
});

export default NotificationsScreen;
