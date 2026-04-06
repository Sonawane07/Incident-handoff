import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Comment, CreateCommentInput } from '../types';

export const useComments = (incidentId: string) => {
  return useQuery({
    queryKey: ['comments', incidentId],
    queryFn: async () => {
      const response = await api.get<Comment[]>(`/incidents/${incidentId}/comments`);
      return response.data;
    },
    enabled: !!incidentId,
  });
};

export const useCreateComment = (incidentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const response = await api.post<Comment>(`/incidents/${incidentId}/comments`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', incidentId] });
    },
  });
};
