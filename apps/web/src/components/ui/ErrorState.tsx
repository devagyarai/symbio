import { AlertTriangle } from 'lucide-react';
import { Button } from 'ui';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg min-h-[200px]">
      <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-1">{title}</h3>
      <p className="text-sm text-red-600 dark:text-red-300 max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-white dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-900/40"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
