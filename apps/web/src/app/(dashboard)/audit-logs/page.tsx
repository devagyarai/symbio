'use client';

import { useState } from 'react';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { Activity, Building2, Server } from 'lucide-react';
import { format } from 'date-fns';
import { TableSkeleton } from '../../../components/ui/TableSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function AuditLogsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [page, setPage] = useState(1);

  // We only fetch first 50 orgs for the dropdown as a simplification
  const { data: orgsData } = useOrganizations(1, 50);
  
  const { data: auditData, isLoading } = useAuditLogs(page, 20, selectedOrgId || undefined);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Activity className="mr-3 text-gray-400" />
          Audit Logs
        </h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-md px-3 py-2 w-full sm:w-auto">
              <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <select
                value={selectedOrgId}
                onChange={(e) => { setSelectedOrgId(e.target.value); setPage(1); }}
                className="bg-transparent border-none focus:ring-0 text-sm w-full sm:w-48 dark:text-white"
              >
                <option value="">All Organizations (Global)</option>
                {orgsData?.data?.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Entity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actor ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Target ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton columns={5} rows={10} />
                  </td>
                </tr>
              ) : auditData?.data?.length > 0 ? (
                auditData.data.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.action.includes('CREATE') || log.action.includes('LOGIN') || log.action.includes('REGISTER') 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : log.action.includes('DELETE') || log.action.includes('LOGOUT') || log.action.includes('ERROR')
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400 font-mono">
                      {log.actorId ? (
                        <span title={log.actorId}>{log.actorId.substring(0, 8)}...</span>
                      ) : (
                        <span className="text-gray-400 italic">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400 font-mono">
                      {log.entityId ? (
                        <span title={log.entityId}>{log.entityId.substring(0, 8)}...</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400 text-center">
                    <EmptyState 
                      icon={Activity}
                      title="No audit logs found"
                      description="No activities have been recorded yet."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-t border-gray-200 dark:border-zinc-800 sm:px-6 flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-zinc-400">
                Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, auditData?.meta?.total || 0)}</span> of{' '}
                <span className="font-medium">{auditData?.meta?.total || 0}</span> results
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
                  disabled={page >= (auditData?.meta?.totalPages || 1)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
