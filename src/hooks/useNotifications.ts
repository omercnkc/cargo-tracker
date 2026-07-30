import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/notifications/notificationService';

export function useNotifications(onNotificationClick?: (data: any) => void) {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    try {
      // İzinleri kontrol et/iste
      NotificationService.requestPermissions();

      // Ön planda bildirim geldiğinde çalışır
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log('Bildirim alındı:', notification);
      });

      // Kullanıcı bildirime tıkladığında (Deep Link / Navigate) çalışır
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('Bildirime tıklandı:', data);
        if (onNotificationClick && data) {
          onNotificationClick(data);
        }
      });
    } catch (err) {
      console.warn('Notification listener kurulurken uyarı:', err);
    }

    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch {
        // Safe cleanup
      }
    };
  }, [onNotificationClick]);

  return {
    sendNotification: NotificationService.sendLocalNotification,
    notifyStatusChange: NotificationService.notifyStatusChange,
  };
}
