import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/supabase';
import { NotificationService } from '../services/notifications/notificationService';

export function useShipmentRealtime(shipmentId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shipmentId) return;

    // Supabase Realtime WebSocket Kanalına Abone Ol
    const channel = supabase
      .channel(`shipment_realtime_${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${shipmentId}`,
        },
        (payload) => {
          console.log('Realtime Shipment Update:', payload);
          const updatedShipment = payload.new as any;

          // React Query önbelleğini güncelle ve invalid et
          queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
          queryClient.invalidateQueries({ queryKey: ['shipments'] });

          // Kullanıcıya canlı bildirim gönder
          if (updatedShipment && updatedShipment.current_status) {
            NotificationService.notifyStatusChange(
              updatedShipment.tracking_number || 'Kargo',
              updatedShipment.current_status,
              shipmentId
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId, queryClient]);
}
