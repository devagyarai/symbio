import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';

export function useOrganizations(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: ['organizations', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);

      const { data } = await api.get(`/organizations?${params.toString()}`);
      return data;
    },
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string }) => {
      const { data } = await api.post('/organizations', payload);
      return data;
    },
    onMutate: async (newOrg) => {
      await queryClient.cancelQueries({ queryKey: ['organizations'] });
      const previousOrgs = queryClient.getQueryData(['organizations']);
      queryClient.setQueryData(['organizations'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [{ id: 'temp-' + Date.now(), ...newOrg }, ...old.items],
        };
      });
      return { previousOrgs };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Organization created successfully');
    },
    onError: (err: any, newOrg, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(['organizations'], context.previousOrgs);
      }
      toast.error(err.response?.data?.error || 'Failed to create organization');
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const { data } = await api.patch(`/organizations/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
      toast.success('Organization updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update organization');
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/organizations/${id}`);
      return data;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['organizations'] });
      const previousOrgs = queryClient.getQueryData(['organizations']);
      queryClient.setQueryData(['organizations'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item: any) => item.id !== deletedId),
        };
      });
      return { previousOrgs };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Organization deleted successfully');
    },
    onError: (err: any, deletedId, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(['organizations'], context.previousOrgs);
      }
      toast.error(err.response?.data?.error || 'Failed to delete organization');
    },
  });
}
