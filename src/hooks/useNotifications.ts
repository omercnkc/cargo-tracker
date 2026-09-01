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
      notificationListener.current = Notifications.addNotificationReceivedListener((_notification) => {
        // Notification received
      });

      // Kullanıcı bildirime tıkladığında (Deep Link / Navigate) çalışır
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (onNotificationClick && data) {
          onNotificationClick(data);
        }
      });
    } catch {
      // Notification listener fallback
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
