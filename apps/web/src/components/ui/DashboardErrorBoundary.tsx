'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { ErrorState } from './ErrorState';

export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="p-6">
          <ErrorState 
            title="Dashboard Error"
            message={(error as Error).message || 'An unexpected error occurred while loading the dashboard component.'}
            onRetry={resetErrorBoundary}
          />
        </div>
      )}
      onReset={() => {
        // Reset state here if needed
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
