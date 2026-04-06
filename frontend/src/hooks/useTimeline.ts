import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { TimelineEvent, CreateTimelineEventInput } from '../types';

export const useTimelineEvents = (incidentId: string) => {
  return useQuery({
    queryKey: ['timeline', incidentId],
    queryFn: async () => {
      const response = await api.get<TimelineEvent[]>(`/incidents/${incidentId}/timeline`);
      return response.data;
    },
    enabled: !!incidentId,
  });
};

export const useCreateTimelineEvent = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTimelineEventInput) => {
      const response = await api.post<TimelineEvent>(`/incidents/${incidentId}/timeline`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', incidentId] });
    },
  });
};

export const useUpdateTimelineEvent = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await api.patch<TimelineEvent>(`/incidents/${incidentId}/timeline/${id}`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', incidentId] });
    },
  });
};

export const useDeleteTimelineEvent = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/incidents/${incidentId}/timeline/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', incidentId] });
    },
  });
};
