import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationItem {
  id: string;
  type: 'delivered' | 'in_transit' | 'hub' | 'received' | 'reminder' | 'failed';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  packageId?: string;
  createdAt: string;
}

export type NotificationFilter = 'all' | 'unread';

interface NotificationState {
  notifications: NotificationItem[];
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'unread' | 'createdAt'> & { id?: string; unread?: boolean }) => void;
  unreadCount: () => number;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'delivered',
    title: 'Kargonuz Teslim Edildi',
    description: 'KP8943271105 numaralı kargonuz adresinize sorunsuz şekilde teslim edilmiştir.',
    time: '10:30',
    unread: true,
    packageId: '1',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: '2',
    type: 'in_transit',
    title: 'Kargonuz Yolda',
    description: 'Yurtiçi Kargo paketi transfer merkezinden çıkış yaptı ve dağıtıma sunuldu.',
    time: '09:15',
    unread: true,
    packageId: '2',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: '3',
    type: 'hub',
    title: 'Transfer Merkezine Ulaştı',
    description: 'Aras Kargo paketiniz İstanbul Ana Transfer Merkezine giriş yaptı.',
    time: 'Dün',
    unread: true,
    packageId: '3',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: '4',
    type: 'received',
    title: 'Kargo Alındı',
    description: 'Sürat Kargo gönderici şubeden paket teslim alındı ve barkodlandı.',
    time: 'Dün',
    unread: false,
    packageId: '4',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Teslimat Hatırlatması',
    description: 'Trendyol Express paketiniz bugün 14:00 - 18:00 saatleri arasında teslim edilecektir.',
    time: '2 gün önce',
    unread: false,
    packageId: '1',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: defaultNotifications,
      filter: 'all',

      setFilter: (filter) => set({ filter }),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, unread: false } : item
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, unread: false })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((item) => item.id !== id),
        })),

      clearAllNotifications: () =>
        set({
          notifications: [],
        }),

      addNotification: (item) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: item.id || Date.now().toString(),
            type: item.type,
            title: item.title,
            description: item.description,
            time: item.time || 'Şimdi',
            unread: item.unread ?? true,
            packageId: item.packageId,
            createdAt: new Date().toISOString(),
          };
          return { notifications: [newNotif, ...state.notifications] };
        }),

      unreadCount: () => get().notifications.filter((n) => n.unread).length,
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
