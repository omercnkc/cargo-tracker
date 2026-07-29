import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentRepository, ShipmentInsert } from '../repositories/shipment.repository';

export const SHIPMENTS_QUERY_KEY = ['shipments'];
export const COURIERS_QUERY_KEY = ['courier_companies'];

export const useShipments = (userId?: string | null) => {
  return useQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { shipments, error } = await shipmentRepository.getShipments(userId);
      if (error) throw error;
      return shipments;
    },
    enabled: !!userId,
  });
};

export const useShipmentDetail = (shipmentId?: string | null) => {
  return useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: async () => {
      if (!shipmentId) return null;
      const { shipment, error } = await shipmentRepository.getShipmentById(shipmentId);
      if (error) throw error;
      return shipment;
    },
    enabled: !!shipmentId,
  });
};

export const useCourierCompanies = () => {
  return useQuery({
    queryKey: COURIERS_QUERY_KEY,
    queryFn: async () => {
      const { companies, error } = await shipmentRepository.getCourierCompanies();
      if (error) throw error;
      return companies;
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching for static courier list
  });
};

export const useAddShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newShipment: ShipmentInsert) => {
      const { shipment, error } = await shipmentRepository.createShipment(newShipment);
      if (error) throw error;
      return shipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY });
    },
  });
};
