'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from '../../../hooks/useWorkspaces';
import { Users, Plus, Trash2, Edit, Building2, Search, Loader2 } from 'lucide-react';
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  EmptyState,
  Badge
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
  const router = useRouter();

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-xl">
              <Users className="w-6 h-6 text-violet-500" />
            </div>
            Workspaces
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage team workspaces within your organization.</p>
        </div>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedOrgId}
          className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </Button>
      </div>

      <GlassCard className="overflow-hidden p-0 border border-border/50 shadow-sm relative z-10">
        <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-20">
          
          <div className="flex items-center bg-black/5 dark:bg-white/5 border border-transparent rounded-xl px-3 py-1 w-full sm:w-auto h-10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <Building2 className="w-4 h-4 text-muted-foreground mr-2" />
            <Select value={selectedOrgId} onValueChange={(val) => { setSelectedOrgId(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-48 bg-transparent border-none focus:ring-0 shadow-none px-0 h-8 font-medium">
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-10 bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-primary/20 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[300px]">Workspace</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isLoadingOrgs || isLoadingWorkspaces ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-4">
                      <TableSkeleton columns={5} rows={5} />
                    </TableCell>
                  </TableRow>
                ) : !selectedOrgId ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <EmptyState 
                        icon={<Building2 className="w-12 h-12 text-muted-foreground/30" />}
                        title="Select an organization"
                        description="Please select an organization from the dropdown above to view its workspaces."
                      />
                    </TableCell>
                  </TableRow>
                ) : workspacesData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <EmptyState 
                        icon={<Users className="w-12 h-12 text-muted-foreground/30" />}
                        title="No workspaces found"
                        description={search ? `No workspaces matching "${search}"` : "This organization has no workspaces yet."}
                        action={search ? undefined : <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2"/> Create Workspace</Button>}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  workspacesData?.data.map((ws: any) => (
                    <TableRow 
                      key={ws.id}
                      onClick={() => router.push(`/workspaces/${ws.id}`)}
                      className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-violet-500/20 transition-all shadow-sm bg-violet-500/10 text-violet-500">
                            <span className="text-sm font-bold">
                              {ws.name[0]?.toUpperCase()}
                            </span>
                          </Avatar>
                          <div>
                            <span className="font-semibold">{ws.name}</span>
                            <div className="text-[11px] text-muted-foreground">ID: {ws.id.split('-')[0]}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded-md">{ws.slug}</code>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(ws.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <IconButton variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary" onClick={() => router.push(`/workspaces/${ws.id}?tab=settings`)}>
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
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{workspacesData?.data?.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, workspacesData?.meta?.total || 0)}</span> of{' '}
            <span className="font-medium text-foreground">{workspacesData?.meta?.total || 0}</span> results
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
              disabled={page >= (workspacesData?.meta?.totalPages || 1)}
              className="rounded-lg shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Create Modal */}
      <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ModalContent className="sm:max-w-md p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Create Workspace</h3>
                  <p className="text-sm text-muted-foreground">Set up a new space for your team.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="ws-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="ws-name"
                    placeholder="Engineering"
                    className="h-11"
                    {...register('name')}
                    disabled={createWorkspace.isPending}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="ws-slug" className="text-sm font-medium">Slug</label>
                  <Input
                    id="ws-slug"
                    placeholder="engineering-team"
                    className="h-11 font-mono text-sm"
                    {...register('slug')}
                    disabled={createWorkspace.isPending}
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
                disabled={createWorkspace.isPending}
                className="rounded-xl shadow-lg shadow-primary/20 h-10 min-w-[120px]"
              >
                {createWorkspace.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
