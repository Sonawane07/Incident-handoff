import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Attachment } from '../types';

export const useAttachments = (incidentId: string) => {
  return useQuery({
    queryKey: ['attachments', incidentId],
    queryFn: async () => {
      const response = await api.get<Attachment[]>(`/incidents/${incidentId}/attachments`);
      return response.data;
    },
    enabled: !!incidentId,
  });
};

export const useUploadAttachment = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<Attachment>(
        `/incidents/${incidentId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', incidentId] });
    },
  });
};

export const useDeleteAttachment = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/incidents/${incidentId}/attachments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', incidentId] });
    },
  });
};
