import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useOfflineSyncStore } from '../store/offlineSync.store';
import { OfflineQueueRepository } from '../repositories/offlineQueue.repository';
import { SyncEngineService } from '../services/syncEngine.service';
import { PendingMutation, UpdateShipmentStatusPayload } from '../types/offline.types';
import { useTranslation } from '../../../hooks/useTranslation';

export const handleResolveConflictUserChoice = async (
  conflictMutation: PendingMutation,
  serverVersion: number
) => {
  const updatedPayload = {
    ...conflictMutation.mutation,
    payload: {
      ...(conflictMutation.mutation.payload as UpdateShipmentStatusPayload),
      baseVersion: serverVersion,
    },
  };

  const newResolutionIdempotencyKey = `idemp_resolve_${conflictMutation.id}_${Date.now()}`;

  OfflineQueueRepository.updateConflictResolution({
    mutationId: conflictMutation.id,
    updatedMutation: updatedPayload as any,
    newIdempotencyKey: newResolutionIdempotencyKey,
    status: 'pending',
  });

  useOfflineSyncStore.getState().resetConflictState();
  SyncEngineService.triggerSync();
};

export const handleDiscardConflictUserChoice = async (conflictMutationId: string) => {
  OfflineQueueRepository.removeMutation(conflictMutationId);
  useOfflineSyncStore.getState().resetConflictState();
};

export const ConflictResolutionModal: React.FC = () => {
  const { t } = useTranslation();
  const activeConflict = useOfflineSyncStore((state) => state.activeConflict);

  if (!activeConflict) {
    return null;
  }

  const conflictMutation = OfflineQueueRepository.getMutationById(activeConflict.mutationId);
  
  // Robust JSON string vs Object parsing for serverData
  let serverData: any = activeConflict.serverData;
  if (typeof serverData === 'string') {
    try {
      serverData = JSON.parse(serverData);
    } catch {
      serverData = {};
    }
  }

  const serverVersion = serverData?.base_version || serverData?.baseVersion || 1;
  const clientPayload = conflictMutation?.mutation?.payload as any;

  const onApplyMyChanges = () => {
    if (conflictMutation) {
      handleResolveConflictUserChoice(conflictMutation, serverVersion);
    } else {
      useOfflineSyncStore.getState().resetConflictState();
    }
  };

  const onAcceptServerChanges = () => {
    if (activeConflict.mutationId) {
      handleDiscardConflictUserChoice(activeConflict.mutationId);
    } else {
      useOfflineSyncStore.getState().resetConflictState();
    }
  };

  return (
    <Modal visible={!!activeConflict} transparent animationType="slide" testID="conflict-modal">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('offlineConflictTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('offlineConflictSubtitle')}
            </Text>
          </View>

          <ScrollView style={styles.body}>
            <View style={styles.comparisonCard}>
              <Text style={styles.sectionHeader}>{t('offlineConflictLocalHeader')}</Text>
              <Text style={styles.valueText}>
                {t('offlineConflictStatus')}: <Text style={styles.bold}>{clientPayload?.status || 'Güncellendi'}</Text>
              </Text>
            </View>

            <View style={[styles.comparisonCard, styles.serverCard]}>
              <Text style={styles.sectionHeader}>{t('offlineConflictServerHeader')}</Text>
              <Text style={styles.valueText}>
                {t('offlineConflictStatus')}: <Text style={styles.bold}>{serverData?.current_status || serverData?.status || 'Sunucu verisi'}</Text>
              </Text>
              <Text style={styles.valueText}>
                {t('offlineConflictVersion')}: <Text style={styles.bold}>v{serverVersion}</Text>
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onApplyMyChanges}>
              <Text style={styles.primaryButtonText}>{t('offlineConflictApplyLocalBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onAcceptServerChanges}>
              <Text style={styles.secondaryButtonText}>{t('offlineConflictAcceptServerBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  body: {
    marginVertical: 8,
  },
  comparisonCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  serverCard: {
    backgroundColor: '#EFF6FF',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1F2937',
  },
  valueText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#EA580C',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
});
