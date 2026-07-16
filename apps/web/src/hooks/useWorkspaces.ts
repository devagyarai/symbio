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
    onMutate: async (newWorkspace) => {
      await queryClient.cancelQueries({ queryKey: ['workspaces', newWorkspace.organizationId] });
      const previousWorkspaces = queryClient.getQueryData(['workspaces', newWorkspace.organizationId]);
      queryClient.setQueryData(['workspaces', newWorkspace.organizationId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [{ id: 'temp-' + Date.now(), ...newWorkspace }, ...old.items],
        };
      });
      return { previousWorkspaces, organizationId: newWorkspace.organizationId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Workspace created successfully');
    },
    onError: (err: any, variables, context: any) => {
      if (context?.previousWorkspaces) {
        queryClient.setQueryData(['workspaces', context.organizationId], context.previousWorkspaces);
      }
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
    onMutate: async (deletedId) => {
      // In a real app we might need the organizationId to correctly invalidate
      // For now, we will just rely on the invalidation
      await queryClient.cancelQueries({ queryKey: ['workspaces'] });
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

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${workspaceId}/members`);
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, email, role }: { workspaceId: string; email: string; role: string }) => {
      const { data } = await api.post(`/workspaces/${workspaceId}/invites`, { email, role });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('Invitation sent successfully');
      // Could invalidate something if we show pending invites
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to send invitation');
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, memberId, role }: { workspaceId: string; memberId: string; role: string }) => {
      const { data } = await api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', variables.workspaceId] });
      toast.success('Member role updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update role');
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }) => {
      const { data } = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', variables.workspaceId] });
      toast.success('Member removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    },
  });
}
