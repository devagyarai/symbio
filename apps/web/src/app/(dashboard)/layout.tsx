'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, Users, Building2, HardDrive, LogOut, Menu, X, Activity } from 'lucide-react';
import { DashboardErrorBoundary } from '../../components/ui/DashboardErrorBoundary';

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 dark:bg-zinc-950">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-bold dark:text-white">Symbio</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700 dark:text-blue-400' : ''}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-gray-200 dark:border-zinc-800 pt-4">
              <div className="flex items-center px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold mr-3">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 dark:lg:border-zinc-800 lg:bg-white dark:lg:bg-zinc-900 lg:z-50">
          <div className="flex flex-col flex-1 min-h-0 p-6">
            <div className="flex items-center mb-8 px-2">
              <span className="text-2xl font-bold tracking-tight dark:text-white">Symbio</span>
            </div>
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700 dark:text-blue-400' : ''}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-gray-200 dark:border-zinc-800 pt-4">
              <div className="flex items-center px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold mr-3">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 lg:hidden">
            <div className="flex items-center justify-between px-4 h-16">
              <span className="text-xl font-bold dark:text-white">Symbio</span>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-md"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </header>
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
