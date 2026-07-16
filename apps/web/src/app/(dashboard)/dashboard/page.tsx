'use client';

import { useDashboardOverview, useDashboardActivity } from '../../../hooks/useDashboard';
import { Building2, Users, HardDrive, Activity as ActivityIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { GlassCard, Skeleton, EmptyState } from 'ui';

function StatCard({ title, value, icon: Icon, isLoading }: any) {
  return (
    <GlassCard className="p-6 flex items-center">
      <div className="rounded-full bg-primary/10 p-3 mr-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold mt-1">{value}</p>
        )}
      </div>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Organizations" 
          value={overview?.totalOrganizations || 0} 
          icon={Building2} 
          isLoading={overviewLoading} 
        />
        <StatCard 
          title="Workspaces" 
          value={overview?.totalWorkspaces || 0} 
          icon={Users} 
          isLoading={overviewLoading} 
        />
        <StatCard 
          title="Audit Events" 
          value={overview?.auditEventsTotal || 0} 
          icon={ActivityIcon} 
          isLoading={overviewLoading} 
        />
        <StatCard 
          title="Storage Used" 
          value={overview?.storageUsed ? `${(overview.storageUsed / 1024 / 1024).toFixed(2)} MB` : '0 MB'} 
          icon={HardDrive} 
          isLoading={overviewLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section (Placeholder for Recharts) */}
        <GlassCard className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
          <div className="h-64 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg border border-dashed border-border">
            <span className="text-muted-foreground text-sm">Chart visualization coming soon</span>
          </div>
        </GlassCard>

        {/* Recent Activity Feed */}
        <GlassCard className="p-6 flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="flex-1 overflow-y-auto pr-2">
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1 pt-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity?.auditLogs?.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activity.auditLogs.map((log: any) => (
                  <div key={log.id} className="relative flex items-start gap-4 z-10">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background flex-shrink-0 mt-0.5">
                      <ActivityIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">{log.action}</span> on <span className="font-medium">{log.entity}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState 
                  icon={<ActivityIcon className="w-10 h-10" />}
                  title="No recent activity"
                  description="Your recent actions will appear here."
                />
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
