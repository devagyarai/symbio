import { Skeleton } from 'ui';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 py-3 px-6">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 px-4">
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      {/* Body */}
      <div className="divide-y divide-gray-200 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex py-4 px-6 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-4">
                <Skeleton className={`h-4 ${colIndex === 0 ? 'w-32' : 'w-24'}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
