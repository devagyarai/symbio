'use client';

import { useState } from 'react';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from '../../../hooks/useWorkspaces';
import { Users, Plus, Trash2, Edit, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TableSkeleton } from '../../../components/ui/TableSkeleton';
import {
  Button,
  IconButton,
  Input,
  SearchInput,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Avatar,
  Modal,
  ModalContent,
  GlassCard,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  EmptyState,
  Skeleton
} from 'ui';

const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export default function WorkspacesPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '', slug: '' },
  });

  const { data: orgsData, isLoading: isLoadingOrgs } = useOrganizations(1, 50);
  
  if (!selectedOrgId && orgsData?.data?.length > 0) {
    setSelectedOrgId(orgsData.data[0].id);
  }

  const { data: workspacesData, isLoading: isLoadingWorkspaces } = useWorkspaces(selectedOrgId, page, 10, search);
  
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const onSubmit = async (data: CreateWorkspaceFormValues) => {
    if (!selectedOrgId) return;
    
    await createWorkspace.mutateAsync({ 
      ...data,
      organizationId: selectedOrgId 
    });
    
    setIsCreateModalOpen(false);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workspace?')) {
      await deleteWorkspace.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-3 text-muted-foreground" />
          Workspaces
        </h1>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedOrgId}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </Button>
      </div>

      <GlassCard className="overflow-hidden p-0 border-0 shadow-sm">
        <div className="p-4 border-b border-border bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          <div className="flex items-center bg-background border border-input rounded-md px-3 py-1 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-muted-foreground mr-2" />
            <Select value={selectedOrgId} onValueChange={(val) => { setSelectedOrgId(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-48 bg-transparent border-none focus:ring-0 shadow-none px-0 h-8">
                <SelectValue placeholder="Select Organization" />
              </SelectTrigger>
              <SelectContent>
                {orgsData?.data?.map((org: any) => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full max-w-md">
            <SearchInput
              placeholder="Search workspaces..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOrgs || isLoadingWorkspaces ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-0">
                    <TableSkeleton columns={4} rows={5} />
                  </TableCell>
                </TableRow>
              ) : !selectedOrgId ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Please select an organization to view workspaces.
                  </TableCell>
                </TableRow>
              ) : workspacesData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <EmptyState 
                      icon={<Users className="w-10 h-10" />}
                      title="No workspaces found"
                      description={search ? `No workspaces matching "${search}"` : "This organization has no workspaces yet."}
                      action={search ? undefined : <Button onClick={() => setIsCreateModalOpen(true)}>Create Workspace</Button>}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                workspacesData?.data.map((ws: any) => (
                  <TableRow key={ws.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                          <span className="text-sm font-bold">
                            {ws.name[0]?.toUpperCase()}
                          </span>
                        </Avatar>
                        <span className="font-medium">{ws.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ws.slug}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(ws.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <IconButton variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" onClick={() => handleDelete(ws.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{workspacesData?.data?.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="font-medium">{Math.min(page * 10, workspacesData?.meta?.total || 0)}</span> of{' '}
            <span className="font-medium">{workspacesData?.meta?.total || 0}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (workspacesData?.meta?.totalPages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Create Modal */}
      <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-4">
                Create Workspace
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="ws-name" className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    id="ws-name"
                    {...register('name')}
                    disabled={createWorkspace.isPending}
                  />
                  {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="ws-slug" className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    id="ws-slug"
                    {...register('slug')}
                    disabled={createWorkspace.isPending}
                  />
                  {errors.slug && <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createWorkspace.isPending}
              >
                {createWorkspace.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
