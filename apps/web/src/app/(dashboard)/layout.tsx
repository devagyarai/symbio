'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, Users, Building2, HardDrive, LogOut, Menu, X, Activity, ChevronsLeft, ChevronsRight, Search, Zap, Bell, Moon, Sun } from 'lucide-react';
import { DashboardErrorBoundary } from '../../components/ui/DashboardErrorBoundary';
import { GlobalCommandPalette } from '../../components/GlobalCommandPalette';
import { AIAssistantWidget } from '../../components/AIAssistantWidget';
import { Sidebar, Navbar, Button, IconButton, Avatar, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownItem } from 'ui';
import { cn } from 'ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
    { name: 'Workspaces', href: '/workspaces', icon: Users },
    { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
    { name: 'Storage', href: '/storage', icon: HardDrive },
  ];

  const WorkspaceSwitcher = () => (
    <div className={cn("px-4 py-4 flex items-center relative z-10", collapsed ? "justify-center px-2" : "")}>
      {collapsed ? (
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10 shadow-sm">
          <Zap className="w-5 h-5 text-primary" />
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start h-12 bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 transition-all rounded-xl shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center mr-3 shrink-0 shadow-inner">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col items-start truncate">
                <span className="text-sm font-semibold">Acme Corp</span>
                <span className="text-xs text-muted-foreground">Free Plan</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px]">
            <DropdownItem>Acme Corp</DropdownItem>
            <DropdownItem>Global Industries</DropdownItem>
            <DropdownItem>Stark Labs</DropdownItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  const SidebarContent = () => (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center px-6 py-4 mb-2 relative z-10">
        <span className={cn("text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60", collapsed && "hidden")}>Symbio</span>
      </div>
      <WorkspaceSwitcher />
      <nav className="flex-1 space-y-1.5 px-3 mt-4 overflow-y-auto overflow-x-hidden relative z-10">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          const linkContent = (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center rounded-xl transition-all group relative h-10",
                collapsed ? "justify-center px-0 w-10 mx-auto" : "px-3",
                isActive 
                  ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-[18px] h-[18px] mr-3")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate text-sm"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Active Indicator Glow */}
              {isActive && !collapsed && (
                 <motion.div layoutId="activeNavIndicator" className="absolute left-0 w-1 h-6 bg-white/20 rounded-r-full" />
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="ml-2 font-medium">{item.name}</TooltipContent>
              </Tooltip>
            );
          }
          return linkContent;
        })}
      </nav>
      <div className="mt-auto p-4 border-t border-border/50 flex flex-col gap-3 relative z-10 bg-background/50 backdrop-blur-sm">
        <div className={cn("flex items-center p-2 rounded-xl bg-black/5 dark:bg-white/5", collapsed ? "justify-center" : "")}>
          <Avatar className={cn("shrink-0 ring-2 ring-primary/20", collapsed ? "w-8 h-8" : "mr-3 w-9 h-9")}>
            <span className="text-xs font-bold text-primary">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        {!collapsed ? (
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 px-3 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton variant="ghost" className="w-10 h-10 mx-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => logout()}>
                <LogOut className="w-[18px] h-[18px]" />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2 font-medium">Sign Out</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );

  return (
    <AuthGuard>
      <GlobalCommandPalette />
      <AIAssistantWidget />
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090B] text-foreground font-sans selection:bg-primary/20">
        
        {/* Mobile sidebar overlay */}
        <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-72 bg-background p-0 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 px-2">Symbio</span>
              <IconButton aria-label="Close sidebar" variant="ghost" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <Sidebar className="w-full border-r-0 h-full">
              <SidebarContent />
            </Sidebar>
          </div>
        </div>

        {/* Desktop sidebar */}
        <Sidebar collapsed={collapsed} className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-50 group transition-all duration-300">
          <SidebarContent />
          <IconButton
            aria-label="Toggle sidebar"
            variant="ghost"
            className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-border shadow-sm bg-background hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:scale-110"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronsRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronsLeft className="w-3.5 h-3.5 text-muted-foreground" />}
          </IconButton>
        </Sidebar>

        {/* Main content wrapper */}
        <div className={cn("flex flex-col min-h-screen transition-all duration-300 ease-in-out", collapsed ? "lg:pl-20" : "lg:pl-64")}>
          
          {/* Desktop Premium Floating Navbar */}
          <Navbar className="hidden lg:flex">
            <div className="flex-1 flex items-center">
              <Button variant="outline" className="text-muted-foreground w-64 justify-start bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 rounded-xl h-10 shadow-inner group">
                <Search className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-medium">Search anything...</span>
                <span className="ml-auto text-[10px] font-semibold bg-background rounded-md px-1.5 py-0.5 border shadow-sm tracking-widest text-muted-foreground">⌘K</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <IconButton aria-label="Notifications" variant="ghost" className="rounded-full w-9 h-9 relative">
                <Bell className="w-[18px] h-[18px] text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
              </IconButton>
              {mounted && (
                <IconButton 
                  aria-label="Toggle theme"
                  variant="ghost" 
                  className="rounded-full w-9 h-9" 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="w-[18px] h-[18px] text-muted-foreground" /> : <Moon className="w-[18px] h-[18px] text-muted-foreground" />}
                </IconButton>
              )}
              <div className="w-px h-5 bg-border mx-2"></div>
              <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-primary/20 transition-all cursor-pointer">
                <span className="text-xs font-bold text-primary">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </Avatar>
            </div>
          </Navbar>

          {/* Mobile Navbar */}
          <Navbar className="lg:hidden justify-between px-4 bg-background/80 backdrop-blur-md rounded-none mx-0 mt-0 h-16 border-b border-border shadow-none sticky top-0">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Symbio</span>
            <div className="flex items-center space-x-2">
              <IconButton aria-label="Open sidebar" variant="ghost" className="w-9 h-9" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </IconButton>
            </div>
          </Navbar>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full h-full">
              <DashboardErrorBoundary>
                {children}
              </DashboardErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
