import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useOfflineSyncStore } from '../store/offlineSync.store';
import { SyncEngineService } from '../services/syncEngine.service';
import { useTranslation } from '../../../hooks/useTranslation';

export const OfflineStatusBar: React.FC = () => {
  const { t } = useTranslation();
  const isOnline = useOfflineSyncStore((state) => state.isOnline);
  const pendingCount = useOfflineSyncStore((state) => state.pendingCount);
  const conflictCount = useOfflineSyncStore((state) => state.conflictCount);
  const syncStatus = useOfflineSyncStore((state) => state.syncStatus);

  if (isOnline && pendingCount === 0 && conflictCount === 0 && syncStatus === 'idle') {
    return null; // Don't show status bar when online and completely idle
  }

  const handleManualSync = () => {
    SyncEngineService.triggerSync();
  };

  if (!isOnline) {
    return (
      <View style={[styles.bar, styles.offlineBar]} testID="offline-status-bar">
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.text}>
          {t('offlineStatusOffline')} {pendingCount > 0 ? `(${pendingCount} ${t('offlineStatusPendingItems')})` : ''}
        </Text>
      </View>
    );
  }

  if (conflictCount > 0) {
    return (
      <View style={[styles.bar, styles.conflictBar]} testID="conflict-status-bar">
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.text}>{conflictCount} {t('offlineStatusConflictCount')}</Text>
        <TouchableOpacity style={styles.syncButton} onPress={handleManualSync}>
          <Text style={styles.syncButtonText}>{t('offlineStatusResolveBtn')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <View style={[styles.bar, styles.syncingBar]} testID="syncing-status-bar">
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
        <Text style={styles.text}>{t('offlineStatusSyncing')} ({pendingCount})...</Text>
      </View>
    );
  }

  if (syncStatus === 'success') {
    return (
      <View style={[styles.bar, styles.successBar]} testID="success-status-bar">
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.text}>{t('offlineStatusSuccess')}</Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <View style={[styles.bar, styles.pendingBar]} testID="pending-status-bar">
        <Text style={styles.icon}>⏳</Text>
        <Text style={styles.text}>{pendingCount} {t('offlineStatusPendingWait')}</Text>
        <TouchableOpacity style={styles.syncButton} onPress={handleManualSync}>
          <Text style={styles.syncButtonText}>{t('offlineStatusSyncNowBtn')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  bar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  offlineBar: {
    backgroundColor: '#DC2626',
  },
  conflictBar: {
    backgroundColor: '#EA580C',
  },
  syncingBar: {
    backgroundColor: '#2563EB',
  },
  successBar: {
    backgroundColor: '#16A34A',
  },
  pendingBar: {
    backgroundColor: '#D97706',
  },
  icon: {
    marginRight: 8,
    fontSize: 14,
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
