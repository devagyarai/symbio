'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, Users, Building2, HardDrive, LogOut, Menu, X, Activity } from 'lucide-react';
import { DashboardErrorBoundary } from '../../components/ui/DashboardErrorBoundary';
import { Sidebar, Navbar, Button, IconButton, Avatar } from 'ui';
import { cn } from 'ui';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
    { name: 'Workspaces', href: '/workspaces', icon: Users },
    { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
    { name: 'Storage', href: '/storage', icon: HardDrive },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center mb-8 px-2 py-6">
        <span className="text-2xl font-bold tracking-tight">Symbio</span>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-colors text-sm",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center px-2 py-3 mb-2">
          <Avatar className="mr-3">
            <span className="text-xs font-bold text-primary">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => logout()}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Mobile sidebar overlay */}
        <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-surface p-0 flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-xl font-bold">Symbio</span>
              <IconButton variant="ghost" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <Sidebar className="w-full border-r-0 h-full">
              <SidebarContent />
            </Sidebar>
          </div>
        </div>

        {/* Desktop sidebar */}
        <Sidebar className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-50 bg-transparent">
          <SidebarContent />
        </Sidebar>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <Navbar className="lg:hidden justify-between px-4 bg-transparent backdrop-blur-md">
            <span className="text-xl font-bold">Symbio</span>
            <IconButton
              variant="ghost"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </IconButton>
          </Navbar>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <DashboardErrorBoundary>
              {children}
            </DashboardErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
