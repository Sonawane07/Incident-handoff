import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { 
  Incident, 
  CreateIncidentInput, 
  PaginatedResponse,
  IncidentStatus 
} from '../types';

export const useIncidents = (page = 1, perPage = 20, filters?: { status?: IncidentStatus; severity?: string }) => {
  return useQuery({
    queryKey: ['incidents', page, perPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.severity && { severity: filters.severity }),
      });
      const response = await api.get<PaginatedResponse<Incident>>(`/incidents?${params}`);
      return response.data;
    },
  });
};

export const useIncident = (id: string) => {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const response = await api.get<Incident>(`/incidents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateIncidentInput) => {
      const response = await api.post<Incident>('/incidents', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useUpdateIncidentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: IncidentStatus }) => {
      const response = await api.post<Incident>(`/incidents/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incident', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useSearchIncidents = (query: string) => {
  return useQuery({
    queryKey: ['incidents', 'search', query],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Incident>>(`/incidents?q=${encodeURIComponent(query)}`);
      return response.data;
    },
    enabled: query.length > 0,
  });
};
