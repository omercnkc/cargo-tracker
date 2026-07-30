import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PendingMutation {
  id: string;
  type: 'ADD_SHIPMENT' | 'UPDATE_SHIPMENT' | 'DELETE_SHIPMENT';
  payload: any;
  createdAt: string;
}

const OFFLINE_QUEUE_KEY = '@cargo_tracker_offline_queue';

export class OfflineQueueService {
  /**
   * Çevrimdışıyken yapılan işlemi yerel kuyruğa ekler
   */
  static async enqueue(type: PendingMutation['type'], payload: any): Promise<PendingMutation> {
    const existingQueue = await this.getQueue();
    const newMutation: PendingMutation = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
    };

    const updatedQueue = [...existingQueue, newMutation];
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    return newMutation;
  }

  /**
   * Yerel bekleyen işlemler kuyruğunu getirir
   */
  static async getQueue(): Promise<PendingMutation[]> {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Kuyruktaki tüm işlemleri temizler
   */
  static async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  }

  /**
   * İnternet geri geldiğinde yerel kuyruktaki tüm işlemleri Supabase'e senkronize eder
   */
  static async processQueue(processor: (mutation: PendingMutation) => Promise<boolean>): Promise<number> {
    const queue = await this.getQueue();
    if (queue.length === 0) return 0;

    let processedCount = 0;
    const remainingQueue: PendingMutation[] = [];

    for (const item of queue) {
      try {
        const success = await processor(item);
        if (success) {
          processedCount++;
        } else {
          remainingQueue.push(item);
        }
      } catch (error) {
        console.error(`Offline işlem ${item.id} işlenirken hata:`, error);
        remainingQueue.push(item);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
    return processedCount;
  }
}
