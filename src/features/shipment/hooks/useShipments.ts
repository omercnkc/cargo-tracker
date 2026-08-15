import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentRepository, ShipmentInsert } from '../repositories/shipment.repository';
import {
  AddShipmentPayload,
  UpdateShipmentStatusPayload,
  UpdateShipmentDetailsPayload,
  ArchiveShipmentPayload,
} from '../../offline/types/offline.types';

export const SHIPMENTS_QUERY_KEY = ['shipments'];
export const COURIERS_QUERY_KEY = ['courier_companies'];

export const useShipments = (userId?: string | null) => {
  return useQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { shipments } = await shipmentRepository.getShipments(userId);
      return shipments || [];
    },
    enabled: !!userId,
  });
};

export const useShipmentDetail = (shipmentId?: string | null, userId?: string | null) => {
  return useQuery({
    queryKey: ['shipment', shipmentId, userId],
    queryFn: async () => {
      if (!shipmentId) return null;
      const { shipment } = await shipmentRepository.getShipmentById(shipmentId, userId || undefined);
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
    mutationFn: async (
      input: AddShipmentPayload | ShipmentInsert | { newShipment: AddShipmentPayload | ShipmentInsert; userId?: string }
    ) => {
      if ('newShipment' in input) {
        return shipmentRepository.createShipment(input.newShipment, input.userId);
      }
      return shipmentRepository.createShipment(input);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY });
    },
  });
};

export const useUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { payload: UpdateShipmentStatusPayload; userId: string }) => {
      return shipmentRepository.updateShipmentStatus(params.payload, params.userId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY });
    },
  });
};

export const useUpdateShipmentDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { payload: UpdateShipmentDetailsPayload; userId: string }) => {
      return shipmentRepository.updateShipmentDetails(params.payload, params.userId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY });
    },
  });
};

export const useArchiveShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { payload: ArchiveShipmentPayload; userId: string }) => {
      return shipmentRepository.archiveShipment(params.payload, params.userId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY });
    },
  });
};
