import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDashboardOverview(organizationId?: string, workspaceId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'overview', organizationId, workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (workspaceId) params.append('workspaceId', workspaceId);
      
      const { data } = await api.get(`/dashboard/overview?${params.toString()}`);
      return data;
    },
  });
}

export function useDashboardActivity(organizationId?: string, limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activity', organizationId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (organizationId) params.append('organizationId', organizationId);
      
      const { data } = await api.get(`/dashboard/activity?${params.toString()}`);
      return data;
    },
  });
}

export function useDashboardCharts(organizationId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['dashboard', 'charts', organizationId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const { data } = await api.get(`/dashboard/charts?${params.toString()}`);
      return data;
    },
  });
}
