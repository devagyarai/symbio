'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from 'ui';

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-violet-500/10 rounded-full blur-[120px]" style={{ animationDuration: '4s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md z-10 relative"
      >
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative px-6 py-2 bg-background ring-1 ring-border rounded-xl">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Symbio</span>
            </div>
          </div>
        </div>

        <GlassCard className="p-8 shadow-2xl ring-1 ring-white/10 dark:ring-white/5 backdrop-blur-2xl bg-white/60 dark:bg-zinc-900/60 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-violet-500/50 to-primary/50" />
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground text-center">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          
          {children}
        </GlassCard>
      </motion.div>
    </main>
  );
}
