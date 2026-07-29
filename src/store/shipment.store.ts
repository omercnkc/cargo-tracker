import { create } from 'zustand';

export type ShipmentFilterStatus = 'all' | 'transit' | 'delivered' | 'pending';

interface ShipmentUIState {
  filterStatus: ShipmentFilterStatus;
  searchQuery: string;
  selectedShipmentId: string | null;

  setFilterStatus: (status: ShipmentFilterStatus) => void;
  setSearchQuery: (query: string) => void;
  setSelectedShipmentId: (id: string | null) => void;
  resetFilters: () => void;
}

export const useShipmentStore = create<ShipmentUIState>((set) => ({
  filterStatus: 'all',
  searchQuery: '',
  selectedShipmentId: null,

  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedShipmentId: (id) => set({ selectedShipmentId: id }),
  resetFilters: () => set({ filterStatus: 'all', searchQuery: '', selectedShipmentId: null }),
}));
