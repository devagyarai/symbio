import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';

export function useWorkspaces(organizationId: string, page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: ['workspaces', organizationId, page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);

      const { data } = await api.get(`/workspaces?${params.toString()}`);
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string; organizationId: string }) => {
      const { data } = await api.post('/workspaces', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Workspace created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create workspace');
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const { data } = await api.patch(`/workspaces/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      // Simplification: invalidate all workspaces queries for now
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', variables.id] });
      toast.success('Workspace updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update workspace');
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/workspaces/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Workspace deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete workspace');
    },
  });
}
