'use client';

import { useState } from 'react';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from '../../../hooks/useWorkspaces';
import { Users, Search, Plus, Trash2, Edit, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TableSkeleton } from '../../../components/ui/TableSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

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

  // We only fetch first 50 orgs for the dropdown as a simplification
  const { data: orgsData, isLoading: isLoadingOrgs } = useOrganizations(1, 50);
  
  // Auto-select first org if none selected
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Users className="mr-3 text-gray-400" />
          Workspaces
        </h1>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedOrgId}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-zinc-900/50">
          
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-md px-3 py-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
            <select
              value={selectedOrgId}
              onChange={(e) => { setSelectedOrgId(e.target.value); setPage(1); }}
              className="bg-transparent border-none focus:ring-0 text-sm w-full sm:w-48 dark:text-white"
            >
              <option value="" disabled>Select Organization</option>
              {orgsData?.data?.map((org: any) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search workspaces..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md leading-5 bg-white dark:bg-zinc-950 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
              {isLoadingOrgs || isLoadingWorkspaces ? (
                <tr>
                  <td colSpan={4}>
                    <TableSkeleton columns={4} rows={5} />
                  </td>
                </tr>
              ) : !selectedOrgId ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-zinc-400">
                    Please select an organization to view workspaces.
                  </td>
                </tr>
              ) : workspacesData?.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400 text-center">
                    <EmptyState 
                      icon={Users}
                      title="No workspaces found"
                      description={search ? `No workspaces matching "${search}"` : "This organization has no workspaces yet."}
                      action={search ? undefined : { label: 'Create Workspace', onClick: () => setIsCreateModalOpen(true) }}
                    />
                  </td>
                </tr>
              ) : (
                workspacesData.data.map((ws: any) => (
                  <tr key={ws.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-sm mr-3">
                          {ws.name[0]?.toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ws.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                      {ws.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                      {format(new Date(ws.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ws.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-t border-gray-200 dark:border-zinc-800 sm:px-6 flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-zinc-400">
                Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, workspacesData?.meta?.total || 0)}</span> of{' '}
                <span className="font-medium">{workspacesData?.meta?.total || 0}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (workspacesData?.meta?.totalPages || 1)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setIsCreateModalOpen(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-zinc-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-zinc-800">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    Create Workspace
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="ws-name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Name</label>
                      <input
                        type="text"
                        id="ws-name"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-zinc-700 dark:bg-zinc-950 rounded-md py-2 px-3 dark:text-white"
                        {...register('name')}
                        disabled={createWorkspace.isPending}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="ws-slug" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Slug</label>
                      <input
                        type="text"
                        id="ws-slug"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-zinc-700 dark:bg-zinc-950 rounded-md py-2 px-3 dark:text-white"
                        {...register('slug')}
                        disabled={createWorkspace.isPending}
                      />
                      {errors.slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug.message}</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-950 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={createWorkspace.isPending}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                  >
                    {createWorkspace.isPending ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-zinc-700 shadow-sm px-4 py-2 bg-white dark:bg-zinc-900 text-base font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
