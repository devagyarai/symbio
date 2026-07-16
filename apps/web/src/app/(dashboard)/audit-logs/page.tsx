'use client';

import { useState } from 'react';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { Activity, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { TableSkeleton } from '../../../components/ui/TableSkeleton';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  GlassCard,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  EmptyState,
  Skeleton
} from 'ui';

export default function AuditLogsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: orgsData } = useOrganizations(1, 50);
  
  const { data: auditData, isLoading } = useAuditLogs(page, 20, selectedOrgId || undefined);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Activity className="mr-3 text-muted-foreground" />
          Audit Logs
        </h1>
      </div>

      <GlassCard className="overflow-hidden p-0 border-0 shadow-sm">
        <div className="p-4 border-b border-border bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center bg-background border border-input rounded-md px-3 py-1 w-full sm:w-auto">
              <Building2 className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
              <Select value={selectedOrgId} onValueChange={(val) => { setSelectedOrgId(val === 'global' ? '' : val); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-48 bg-transparent border-none focus:ring-0 shadow-none px-0 h-8">
                  <SelectValue placeholder="All Organizations (Global)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">All Organizations (Global)</SelectItem>
                  {orgsData?.data?.map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor ID</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <TableSkeleton columns={5} rows={10} />
                  </TableCell>
                </TableRow>
              ) : auditData?.data?.length > 0 ? (
                auditData.data.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.action.includes('CREATE') || log.action.includes('LOGIN') || log.action.includes('REGISTER') 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : log.action.includes('DELETE') || log.action.includes('LOGOUT') || log.action.includes('ERROR')
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.entity}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {log.actorId ? (
                        <span title={log.actorId}>{log.actorId.substring(0, 8)}...</span>
                      ) : (
                        <span className="text-muted-foreground italic">System</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {log.entityId ? (
                        <span title={log.entityId}>{log.entityId.substring(0, 8)}...</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <EmptyState 
                      icon={<Activity className="w-10 h-10" />}
                      title="No audit logs found"
                      description="No activities have been recorded yet."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{auditData?.data?.length > 0 ? (page - 1) * 20 + 1 : 0}</span> to <span className="font-medium">{Math.min(page * 20, auditData?.meta?.total || 0)}</span> of{' '}
            <span className="font-medium">{auditData?.meta?.total || 0}</span> results
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
              disabled={page >= (auditData?.meta?.totalPages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
