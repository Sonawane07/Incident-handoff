import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { DashboardMetrics } from '../types';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await api.get<DashboardMetrics>('/metrics');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
