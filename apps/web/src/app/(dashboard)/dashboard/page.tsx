'use client';

import { useDashboardOverview, useDashboardActivity } from '../../../hooks/useDashboard';
import { Building2, Users, HardDrive, Activity as ActivityIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

function StatCard({ title, value, icon: Icon, isLoading }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center">
      <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-3 mr-4">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</h3>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
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
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-zinc-950/50 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800">
            <span className="text-gray-500 dark:text-zinc-500 text-sm">Chart visualization coming soon</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
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
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-zinc-800 before:to-transparent">
                {activity.auditLogs.map((log: any) => (
                  <div key={log.id} className="relative flex items-start gap-4 z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-white dark:border-zinc-900 flex-shrink-0 mt-0.5">
                      <ActivityIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 dark:text-zinc-200">
                        <span className="font-semibold">{log.action}</span> on <span className="font-medium">{log.entity}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState 
                  icon={ActivityIcon}
                  title="No recent activity"
                  description="Your recent actions will appear here."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
