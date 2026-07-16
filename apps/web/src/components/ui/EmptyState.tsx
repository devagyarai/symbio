import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg min-h-[300px]">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full mb-4">
        <Icon className="w-6 h-6 text-gray-500 dark:text-zinc-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
