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

export const useGenerateAISummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await api.post<{ message: string; task_id: string }>(
        `/incidents/${incidentId}/ai-summary`
      );
      return response.data;
    },
    onSuccess: (_, incidentId) => {
      // Poll for new summaries after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ai-summaries', incidentId] });
      }, 3000);
    },
  });
};

export const useUpdateAISummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      incidentId, 
      summaryId, 
      data 
    }: { 
      incidentId: string; 
      summaryId: string; 
      data: Partial<AISummary> 
    }) => {
      const response = await api.patch<AISummary>(
        `/incidents/${incidentId}/ai-summary/${summaryId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries', variables.incidentId] });
    },
  });
};

export const useApproveAISummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ incidentId, summaryId }: { incidentId: string; summaryId: string }) => {
      const response = await api.post<AISummary>(
        `/incidents/${incidentId}/ai-summary/${summaryId}/approve`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries', variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
};

export const useDiscardAISummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ incidentId, summaryId }: { incidentId: string; summaryId: string }) => {
      const response = await api.post<AISummary>(
        `/incidents/${incidentId}/ai-summary/${summaryId}/discard`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries', variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
};
