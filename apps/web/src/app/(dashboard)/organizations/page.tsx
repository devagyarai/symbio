'use client';

import { useState } from 'react';
import { useOrganizations, useCreateOrganization, useDeleteOrganization } from '../../../hooks/useOrganizations';
import { Building2, Plus, Trash2, Edit, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TableSkeleton } from '../../../components/ui/TableSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
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
  EmptyState,
  Badge
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            Organizations
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your enterprise organizations and settings.</p>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-10">
          <Plus className="w-4 h-4 mr-2" />
          New Organization
        </Button>
      </div>

      <GlassCard className="overflow-hidden p-0 border border-border/50 shadow-sm relative z-10">
        <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-xl flex justify-between items-center sticky top-0 z-20">
          <div className="relative w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton columns={4} />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">Organization</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {data?.data?.length > 0 ? (
                    data.data.map((org: any) => (
                      <TableRow 
                        key={org.id} 
                        className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
                              <span className="text-sm font-bold text-primary">
                                {org.name[0]?.toUpperCase()}
                              </span>
                            </Avatar>
                            <div>
                              <span className="font-semibold">{org.name}</span>
                              <div className="text-[11px] text-muted-foreground">ID: {org.id.split('-')[0]}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded-md">{org.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(org.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <IconButton variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
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
                      <TableCell colSpan={5} className="h-64 text-center">
                        <EmptyState 
                          icon={<Building2 className="w-12 h-12 text-muted-foreground/30" />}
                          title="No organizations found"
                          description={search ? `No organizations matching "${search}"` : "You haven't created any organizations yet. Start by creating one."}
                          action={search ? undefined : <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2"/> Create Organization</Button>}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{data?.data?.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, data?.meta?.total || 0)}</span> of{' '}
            <span className="font-medium text-foreground">{data?.meta?.total || 0}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg shadow-sm"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (data?.meta?.totalPages || 1)}
              className="rounded-lg shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Create Modal */}
      <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ModalContent aria-label="Create Organization" className="sm:max-w-md p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Create Organization</h3>
                  <p className="text-sm text-muted-foreground">Set up a new workspace environment.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="org-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="org-name"
                    placeholder="Acme Corp"
                    className="h-11"
                    {...register('name')}
                    disabled={createOrg.isPending}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="org-slug" className="text-sm font-medium">Slug</label>
                  <Input
                    id="org-slug"
                    placeholder="acme-corp"
                    className="h-11 font-mono text-sm"
                    {...register('slug')}
                    disabled={createOrg.isPending}
                  />
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createOrg.isPending}
                className="rounded-xl shadow-lg shadow-primary/20 h-10 min-w-[120px]"
              >
                {createOrg.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="sr-only">Creating...</span>
                  </>
                ) : 'Create'}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
