/**
 * Utility functions for Shipment status and progress calculation.
 */

export interface TrackingStep {
  id: 'created' | 'received' | 'transit' | 'destination' | 'out_for_delivery' | 'delivered';
  titleKey: string;
  defaultTitle: string;
  percent: number;
}

export const TRACKING_STEPS: TrackingStep[] = [
  { id: 'created', titleKey: 'stepCreated', defaultTitle: 'Oluşturuldu', percent: 0 },
  { id: 'received', titleKey: 'stepReceived', defaultTitle: 'Teslim Alındı', percent: 20 },
  { id: 'transit', titleKey: 'stepTransit', defaultTitle: 'Transferde', percent: 40 },
  { id: 'destination', titleKey: 'stepDestination', defaultTitle: 'Varış Şubesinde', percent: 60 },
  { id: 'out_for_delivery', titleKey: 'stepOutForDelivery', defaultTitle: 'Dağıtımda', percent: 80 },
  { id: 'delivered', titleKey: 'stepDelivered', defaultTitle: 'Teslim Edildi', percent: 100 },
];

export interface ShipmentProgressInfo {
  stepIndex: number; // 0 to 5
  progressPercent: number; // 0 to 100
  colorType: 'pending' | 'action_required' | 'transit' | 'out_for_delivery' | 'delivered';
  colorHex: string;
  stepTitle: string;
}

/**
 * Calculates 6-step tracking progress info for a shipment status.
 * Steps:
 * 0: Oluşturuldu (0%)
 * 1: Teslim Alındı (20%)
 * 2: Transferde (40%)
 * 3: Varış Şubesinde (60%)
 * 4: Dağıtımda (80%)
 * 5: Teslim Edildi (100%)
 */
export function getShipmentProgress(status?: string | null): ShipmentProgressInfo {
  if (!status) {
    return {
      stepIndex: 0,
      progressPercent: 0,
      colorType: 'pending',
      colorHex: '#F59E0B',
      stepTitle: 'Oluşturuldu',
    };
  }

  const s = status.toLowerCase().trim();

  switch (s) {
    case 'delivered':
    case 'teslim_edildi':
    case 'completed':
    case 'teslim edildi':
      return {
        stepIndex: 5,
        progressPercent: 100,
        colorType: 'delivered',
        colorHex: '#10B981', // Vibrant Emerald Green
        stepTitle: 'Teslim Edildi',
      };

    case 'out_for_delivery':
    case 'dagitimda':
    case 'dağıtımda':
    case 'dağıtıma çıkarıldı':
      return {
        stepIndex: 4,
        progressPercent: 80,
        colorType: 'out_for_delivery',
        colorHex: '#0EA5E9', // Vivid Sky Cyan
        stepTitle: 'Dağıtımda',
      };

    case 'destination':
    case 'destination_branch':
    case 'varis_subesinde':
    case 'varış şubesinde':
    case 'varış şubesi':
    case 'subede':
      return {
        stepIndex: 3,
        progressPercent: 60,
        colorType: 'transit',
        colorHex: '#3B82F6', // Royal Blue
        stepTitle: 'Varış Şubesinde',
      };

    case 'transit':
    case 'in_transit':
    case 'transferde':
    case 'shipped':
    case 'yolda':
    case 'kargoda':
    case 'transfer':
    case 'transfer merkezinde':
      return {
        stepIndex: 2,
        progressPercent: 40,
        colorType: 'transit',
        colorHex: '#2563EB', // Royal Electric Blue
        stepTitle: 'Transferde',
      };

    case 'received':
    case 'teslim_alindi':
    case 'teslim alındı':
    case 'picked_up':
    case 'alındı':
      return {
        stepIndex: 1,
        progressPercent: 20,
        colorType: 'pending',
        colorHex: '#6366F1', // Indigo Accent
        stepTitle: 'Teslim Alındı',
      };

    case 'action_required':
    case 'failed':
    case 'customs_hold':
    case 'gümrük':
    case 'sorunlu':
    case 'işlem gerekli':
      return {
        stepIndex: 2,
        progressPercent: 40,
        colorType: 'action_required',
        colorHex: '#EF4444', // Crimson Warning Red
        stepTitle: 'İşlem Gerekli',
      };

    case 'created':
    case 'oluşturuldu':
    case 'olusturuldu':
    case 'pending':
    case 'preparing':
    case 'siparis_alindi':
    case 'hazırlanıyor':
    case 'bekliyor':
    default:
      return {
        stepIndex: 0,
        progressPercent: 0,
        colorType: 'pending',
        colorHex: '#F59E0B', // Bright Amber Orange
        stepTitle: 'Oluşturuldu',
      };
  }
}
