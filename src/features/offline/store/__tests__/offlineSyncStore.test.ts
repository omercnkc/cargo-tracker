import { useOfflineSyncStore } from '../offlineSync.store';

describe('useOfflineSyncStore Zustand Unit Tests', () => {
  beforeEach(() => {
    useOfflineSyncStore.setState({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 0,
      conflictCount: 0,
      activeConflict: null,
    });
  });

  it('Başlangıç değerleri varsayılan olarak doğru olmalıdır', () => {
    const state = useOfflineSyncStore.getState();
    expect(state.isOnline).toBe(true);
    expect(state.syncStatus).toBe('idle');
    expect(state.pendingCount).toBe(0);
    expect(state.activeConflict).toBeNull();
  });

  it('setIsOnline false verildiğinde syncStatus offline olmalıdır', () => {
    useOfflineSyncStore.getState().setIsOnline(false);
    expect(useOfflineSyncStore.getState().isOnline).toBe(false);
    expect(useOfflineSyncStore.getState().syncStatus).toBe('offline');
  });

  it('pendingCount artırma ve azaltma mantığı 0 altına düşmemelidir', () => {
    useOfflineSyncStore.getState().incrementPendingCount();
    expect(useOfflineSyncStore.getState().pendingCount).toBe(1);

    useOfflineSyncStore.getState().decrementPendingCount();
    expect(useOfflineSyncStore.getState().pendingCount).toBe(0);

    useOfflineSyncStore.getState().decrementPendingCount();
    expect(useOfflineSyncStore.getState().pendingCount).toBe(0);
  });

  it('setConflictState activeConflict ve syncStatus conflict durumuna getirmelidir', () => {
    const serverData = { id: 'ship_1', status: 'delivered' };
    useOfflineSyncStore.getState().setConflictState('mut_123', serverData);

    const state = useOfflineSyncStore.getState();
    expect(state.syncStatus).toBe('conflict');
    expect(state.activeConflict).toEqual({ mutationId: 'mut_123', serverData });

    useOfflineSyncStore.getState().resetConflictState();
    expect(useOfflineSyncStore.getState().activeConflict).toBeNull();
    expect(useOfflineSyncStore.getState().syncStatus).toBe('idle');
  });

  it('setConflictCount ve setSyncStatus aksiyonları doğru güncellenmelidir', () => {
    useOfflineSyncStore.getState().setConflictCount(3);
    expect(useOfflineSyncStore.getState().conflictCount).toBe(3);

    useOfflineSyncStore.getState().setSyncStatus('syncing');
    expect(useOfflineSyncStore.getState().syncStatus).toBe('syncing');
  });
});
