import { create } from 'zustand';
import { SyncStatus } from '../types/offline.types';

export interface ActiveConflictState {
  mutationId: string;
  serverData: any;
}

export interface OfflineSyncState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  conflictCount: number;
  activeConflict: ActiveConflictState | null;

  // Actions
  setIsOnline: (isOnline: boolean) => void;
  setSyncStatus: (syncStatus: SyncStatus) => void;
  setPendingCount: (pendingCount: number) => void;
  setConflictCount: (conflictCount: number) => void;
  setConflictState: (mutationId: string | null, serverData?: any) => void;
  resetConflictState: () => void;
  incrementPendingCount: () => void;
  decrementPendingCount: () => void;
}

export const useOfflineSyncStore = create<OfflineSyncState>((set) => ({
  isOnline: true,
  syncStatus: 'idle',
  pendingCount: 0,
  conflictCount: 0,
  activeConflict: null,

  setIsOnline: (isOnline) =>
    set((state) => ({
      isOnline,
      syncStatus: !isOnline ? 'offline' : state.syncStatus === 'offline' ? 'idle' : state.syncStatus,
    })),

  setSyncStatus: (syncStatus) => set({ syncStatus }),

  setPendingCount: (pendingCount) => set({ pendingCount: Math.max(0, pendingCount) }),

  setConflictCount: (conflictCount) => set({ conflictCount: Math.max(0, conflictCount) }),

  setConflictState: (mutationId, serverData = null) =>
    set((state) => ({
      activeConflict: mutationId ? { mutationId, serverData } : null,
      syncStatus: mutationId ? 'conflict' : state.syncStatus,
    })),

  resetConflictState: () =>
    set((state) => ({
      activeConflict: null,
      syncStatus: state.syncStatus === 'conflict' ? 'idle' : state.syncStatus,
    })),

  incrementPendingCount: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),

  decrementPendingCount: () => set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
}));
