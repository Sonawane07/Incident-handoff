import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { AISummary } from '../types';

export const useAISummaries = (incidentId: string) => {
  return useQuery({
    queryKey: ['ai-summaries', incidentId],
    queryFn: async () => {
      const response = await api.get<AISummary[]>(`/incidents/${incidentId}/ai-summary`);
      return response.data;
    },
    enabled: !!incidentId,
  });
};

export const useGenerateAISummary = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<{ job_id: string }>(`/incidents/${incidentId}/ai-summary`);
      return response.data;
    },
    onSuccess: () => {
      // Poll for updates
      queryClient.invalidateQueries({ queryKey: ['ai-summaries', incidentId] });
    },
  });
};

export const useApproveAISummary = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (summaryId: string) => {
      const response = await api.post<AISummary>(`/incidents/${incidentId}/ai-summary/${summaryId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
  });
};

export const useUpdateAISummary = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, timeline_narrative, next_steps }: { id: string; timeline_narrative: string; next_steps: string[] }) => {
      const response = await api.patch<AISummary>(`/incidents/${incidentId}/ai-summary/${id}`, {
        timeline_narrative,
        next_steps,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries', incidentId] });
    },
  });
};

export const useDiscardAISummary = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (summaryId: string) => {
      const response = await api.post<AISummary>(`/incidents/${incidentId}/ai-summary/${summaryId}/discard`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries', incidentId] });
    },
  });
};
