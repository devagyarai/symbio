'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from 'ui';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl min-h-[200px] shadow-sm glass-2"
    >
      <motion.div
        initial={{ rotate: -15, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.1 }}
      >
        <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
      </motion.div>
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">{title}</h3>
      <p className="text-sm text-red-600 dark:text-red-300 max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-white dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-900/40 transition-all hover:scale-105 active:scale-95"
        >
          Try again
        </Button>
      )}
    </motion.div>
  );
}
