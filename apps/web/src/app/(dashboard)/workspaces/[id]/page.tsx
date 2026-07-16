'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Building2,
  Settings,
  Users,
  Activity,
  HardDrive,
  Sparkles,
  FolderOpen
} from 'lucide-react';
import {
  GlassCard,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'ui';
import { useWorkspace } from '../../../../hooks/useWorkspaces';
import { WorkspaceSettings } from './components/WorkspaceSettings';
import { MembersTab } from './components/MembersTab';

export default function WorkspaceCommandCenter({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: workspace, isLoading } = useWorkspace(resolvedParams.id);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<FolderOpen className="w-12 h-12 text-muted-foreground/30" />}
          title="Workspace not found"
          description="The workspace you are looking for does not exist or you don't have access."
          action={<Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto pb-10"
    >
      {/* Premium Workspace Header */}
      <div className="relative rounded-3xl overflow-hidden glass-2 border border-border/50 p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold text-violet-500">
                {workspace.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-violet-500/10 text-violet-500 border-violet-500/20">
                  {workspace.slug}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  Created {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true })}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {workspace.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-background/50 backdrop-blur-md rounded-xl" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
            <Button className="rounded-xl shadow-lg shadow-violet-500/20 bg-violet-600 hover:bg-violet-700" onClick={() => setActiveTab('members')}>
              <Users className="w-4 h-4 mr-2" />
              Invite Team
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-xl inline-flex mb-6 border border-border/50">
          <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="files" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Files
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0 border-none p-0 outline-none">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <h3 className="text-2xl font-bold">— Active</h3>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <HardDrive className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                  <h3 className="text-2xl font-bold">— MB</h3>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Activity className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Events</p>
                  <h3 className="text-2xl font-bold">— Today</h3>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6 h-[400px] flex items-center justify-center relative overflow-hidden group">
                <div className="text-center relative z-10">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 group-hover:text-violet-500 transition-colors" />
                  <h3 className="text-lg font-bold mb-2">Workspace Activity</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Activity visualizer and intelligence timeline will be generated here.
                  </p>
                  <Button variant="outline" className="mt-6 rounded-xl" onClick={() => setActiveTab('activity')}>
                    View Timeline
                  </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </GlassCard>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl glass-2 border border-border/50 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20 mb-4">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Workspace Intelligence</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI agent will analyze documents and recent decisions in this workspace to provide real-time suggestions.
                  </p>
                  <Button className="w-full mt-6 rounded-xl shadow-lg shadow-violet-500/20 bg-violet-600 hover:bg-violet-700">
                    Open AI Command Center
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-0 border-none p-0 outline-none">
          <GlassCard className="h-[500px] flex items-center justify-center">
            <EmptyState
              icon={<FolderOpen className="w-12 h-12 text-muted-foreground/30" />}
              title="File Explorer coming soon"
              description="Full folder and file management system with drag-and-drop support is coming in the next sprint."
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MembersTab workspaceId={workspace.id} />
        </TabsContent>

        <TabsContent value="activity" className="mt-0 border-none p-0 outline-none">
          <GlassCard className="h-[500px] flex items-center justify-center">
            <EmptyState
              icon={<Activity className="w-12 h-12 text-muted-foreground/30" />}
              title="Activity Timeline"
              description="Causal audit timeline and recent decisions will be rendered here."
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <WorkspaceSettings workspace={workspace} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
