import { create } from 'zustand';

interface ShipmentState {
  shipments: any[]; // Tip tanımlamaları eklenecek
  isLoading: boolean;
  // Actions eklenecek
}

export const useShipmentStore = create<ShipmentState>((set) => ({
  shipments: [],
  isLoading: false,
}));
