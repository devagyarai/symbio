'use client';

import { useState } from 'react';
import { useOrganizations, useCreateOrganization, useDeleteOrganization } from '../../../hooks/useOrganizations';
import { Building2, Plus, Trash2, Edit } from 'lucide-react';
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
  EmptyState
} from 'ui';

const createOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

type CreateOrgFormValues = z.infer<typeof createOrgSchema>;

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: '', slug: '' },
  });

  const { data, isLoading } = useOrganizations(page, 10, search);
  const createOrg = useCreateOrganization();
  const deleteOrg = useDeleteOrganization();

  const onSubmit = async (data: CreateOrgFormValues) => {
    await createOrg.mutateAsync(data);
    setIsCreateModalOpen(false);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      await deleteOrg.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Building2 className="mr-3 text-muted-foreground" />
          Organizations
        </h1>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Organization
        </Button>
      </div>

      <GlassCard className="overflow-hidden p-0 border-0 shadow-sm">
        <div className="p-4 border-b border-border bg-black/5 dark:bg-white/5 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <SearchInput
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton columns={4} />
          ) : (
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
                {data?.data?.length > 0 ? (
                  data.data.map((org: any) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <span className="text-sm font-bold text-primary">
                              {org.name[0]?.toUpperCase()}
                            </span>
                          </Avatar>
                          <span className="font-medium">{org.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{org.slug}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(org.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <IconButton variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </IconButton>
                          <IconButton variant="ghost" size="sm" onClick={() => handleDelete(org.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <EmptyState 
                        icon={<Building2 className="w-10 h-10" />}
                        title="No organizations found"
                        description={search ? `No organizations matching "${search}"` : "You haven't created any organizations yet."}
                        action={search ? undefined : <Button onClick={() => setIsCreateModalOpen(true)}>Create Organization</Button>}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{data?.data?.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="font-medium">{Math.min(page * 10, data?.meta?.total || 0)}</span> of{' '}
            <span className="font-medium">{data?.meta?.total || 0}</span> results
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
              disabled={page >= (data?.meta?.totalPages || 1)}
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
                Create Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    id="org-name"
                    {...register('name')}
                    disabled={createOrg.isPending}
                  />
                  {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="org-slug" className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    id="org-slug"
                    {...register('slug')}
                    disabled={createOrg.isPending}
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
                disabled={createOrg.isPending}
              >
                {createOrg.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
