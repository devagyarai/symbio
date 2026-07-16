'use client';

import { useState } from 'react';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { Activity, Building2, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { TableSkeleton } from '../../../components/ui/TableSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
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
  Badge
} from 'ui';

export default function AuditLogsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: orgsData } = useOrganizations(1, 50);
  
  const { data: auditData, isLoading } = useAuditLogs(page, 20, selectedOrgId || undefined);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Track security and compliance events across the platform.</p>
        </div>
      </div>

      <GlassCard className="overflow-hidden p-0 border border-border/50 shadow-sm relative z-10">
        <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center bg-black/5 dark:bg-white/5 border border-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl px-3 py-1 w-full sm:w-auto h-10">
              {selectedOrgId ? (
                <Building2 className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
              )}
              <Select value={selectedOrgId} onValueChange={(val) => { setSelectedOrgId(val === 'global' ? '' : val); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-56 bg-transparent border-none focus:ring-0 shadow-none px-0 h-8 font-medium">
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
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor ID</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-4">
                      <TableSkeleton columns={5} rows={10} />
                    </TableCell>
                  </TableRow>
                ) : auditData?.data?.length > 0 ? (
                  auditData.data.map((log: any) => (
                    <TableRow 
                      key={log.id}
                      className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell>
                        <Badge 
                          className={`font-medium ${
                            log.action.includes('CREATE') || log.action.includes('LOGIN') || log.action.includes('REGISTER') 
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20'
                              : log.action.includes('DELETE') || log.action.includes('LOGOUT') || log.action.includes('ERROR')
                                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20'
                                : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20'
                          }`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {log.entity}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {log.actorId ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded-md" title={log.actorId}>
                              {log.actorId.substring(0, 12)}...
                            </code>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">System</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.entityId ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded-md" title={log.entityId}>
                            {log.entityId.substring(0, 12)}...
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <EmptyState 
                        icon={<Activity className="w-12 h-12 text-muted-foreground/30" />}
                        title="No audit logs found"
                        description="No activities have been recorded yet."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{auditData?.data?.length > 0 ? (page - 1) * 20 + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(page * 20, auditData?.meta?.total || 0)}</span> of{' '}
            <span className="font-medium text-foreground">{auditData?.meta?.total || 0}</span> results
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
              disabled={page >= (auditData?.meta?.totalPages || 1)}
              className="rounded-lg shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
