'use client';

import { useDashboardOverview, useDashboardActivity } from '../../../hooks/useDashboard';
import { Building2, Users, HardDrive, Activity as ActivityIcon, Sparkles, ArrowRight, Zap, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { GlassCard, Skeleton, EmptyState, Button, Badge } from 'ui';
import { motion, Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

function StatCard({ title, value, icon: Icon, isLoading, delay = 0, colorClass = "text-primary", bgClass = "bg-primary/10" }: any) {
  return (
    <motion.div variants={item}>
      <GlassCard className="p-6 flex items-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className={`rounded-2xl ${bgClass} p-4 mr-5 ring-1 ring-black/5 dark:ring-white/5 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          )}
        </div>
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${bgClass} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
      </GlassCard>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();

  return (
    <motion.div 
      className="space-y-8 pb-10"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Premium Hero Area */}
      <motion.div variants={item} className="relative rounded-3xl overflow-hidden glass-2 border border-border/50 p-8 md:p-10 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 mr-1" /> Enterprise Workspace
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Welcome back, Commander
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Your ecosystem is healthy. Manage your workspaces and teams from the command center.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="rounded-xl shadow-lg shadow-primary/20" size="lg" onClick={() => window.location.href = '/workspaces'}>
              <Sparkles className="w-4 h-4 mr-2" />
              Go to Workspaces
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Organizations" 
          value={overview?.totalOrganizations || 0} 
          icon={Building2} 
          isLoading={overviewLoading}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
        />
        <StatCard 
          title="Workspaces" 
          value={overview?.totalWorkspaces || 0} 
          icon={Users} 
          isLoading={overviewLoading}
          colorClass="text-violet-500"
          bgClass="bg-violet-500/10"
        />
        <StatCard 
          title="Audit Events" 
          value={overview?.auditEventsTotal || 0} 
          icon={ActivityIcon} 
          isLoading={overviewLoading}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
        />
        <StatCard 
          title="Storage Used" 
          value={overview?.storageUsed ? `${(overview.storageUsed / 1024 / 1024).toFixed(2)} MB` : '0 MB'} 
          icon={HardDrive} 
          isLoading={overviewLoading}
          colorClass="text-orange-500"
          bgClass="bg-orange-500/10"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Insight Panel */}
          <motion.div variants={item}>
            <div className="rounded-2xl glass-2 border border-border/50 p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 relative">
                  <Sparkles className="w-6 h-6 text-primary relative z-10" />
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping opacity-20" />
                </div>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    Symbio Intelligence <Badge className="bg-primary text-primary-foreground hover:bg-primary h-5 text-[10px]">NEW</Badge>
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed max-w-2xl">
                    Storage usage in &quot;Global Industries&quot; has increased by 45% in the last 7 days. Consider archiving unused projects or upgrading your tier to prevent bottlenecks.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-medium">Review Usage</Button>
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 text-xs font-medium text-muted-foreground">Dismiss</Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity Overview Chart Placeholder */}
          <motion.div variants={item}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight">System Activity</h2>
                <Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </div>
              <div className="h-64 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-border group hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-crosshair">
                <div className="text-center">
                  <ActivityIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-muted-foreground text-sm font-medium">Interactive Chart visualization coming soon</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Vertical Activity Timeline */}
        <motion.div variants={item} className="h-full">
          <GlassCard className="p-6 flex flex-col h-full sticky top-24">
            <h2 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Real-time Feed
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activityLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                      <div className="space-y-2 flex-1 pt-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity?.auditLogs?.length > 0 ? (
                <div className="relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-px before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent space-y-6">
                  {activity.auditLogs.slice(0, 8).map((log: any, i: number) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex items-start gap-4 z-10 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center border-2 border-border group-hover:border-primary transition-colors flex-shrink-0 z-10">
                        {log.action.includes('CREATE') ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : log.action.includes('DELETE') ? (
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                        ) : (
                          <ActivityIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="pt-1 flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {log.action} <span className="font-normal text-muted-foreground">on</span> {log.entity}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="mt-8">
                  <EmptyState 
                    icon={<ActivityIcon className="w-10 h-10 text-muted-foreground/30" />}
                    title="All clear"
                    description="No recent activity to show."
                  />
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs font-medium text-muted-foreground">
              Load more activity
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
