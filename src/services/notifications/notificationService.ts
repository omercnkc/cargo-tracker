import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

// Expo Go ortamında mı yoksa Development Build / Standalone ortamda mı çalıştığımızı belirler
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === 'expo';

// Uygulama açıkken bildirimlerin nasıl davranacağını belirler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  /**
   * Cihazdan bildirim izinlerini ister (Expo Go ve Native Build uyumlu)
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Kargo Bildirimleri',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00236f',
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Anlık yerel bildirim (Local Notification) tetikler
   */
  static async sendLocalNotification({ title, body, data }: PushNotificationPayload): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Hemen gönder
      });

      return notificationId;
    } catch {
      return null;
    }
  }

  /**
   * Kargo durum değişikliği için bildirim gönderir
   */
  static async notifyStatusChange(trackingNumber: string, newStatus: string, shipmentId?: string) {
    const title = `📦 Kargo Güncellemesi: ${trackingNumber}`;
    const body = `Kargonuzun yeni durumu: "${newStatus}"`;
    return this.sendLocalNotification({
      title,
      body,
      data: { shipmentId, trackingNumber, type: 'STATUS_UPDATE' },
    });
  }
}
