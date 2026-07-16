import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAuditLogs(page = 1, limit = 20, organizationId?: string) {
  return useQuery({
    queryKey: ['audit-logs', page, limit, organizationId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (organizationId) {
        params.append('organizationId', organizationId);
      }

      const { data } = await api.get(`/audit?${params.toString()}`);
      return data;
    },
  });
}
