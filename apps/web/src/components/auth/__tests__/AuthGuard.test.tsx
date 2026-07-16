import { render, screen } from '@testing-library/react';
import { AuthGuard } from '../AuthGuard';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

// Mock the zustand store
jest.mock('../../../store/useAuthStore');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('AuthGuard Component', () => {
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
  const mockRouter = { replace: jest.fn(), push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  it('renders children when authenticated and initialized', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isInitialized: true,
    } as any);

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated and initialized', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isInitialized: true,
    } as any);

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected</div>
      </AuthGuard>
    );

    expect(mockRouter.push).toHaveBeenCalledWith('/login');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows loading state when not initialized', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isInitialized: false,
    } as any);

    const { container } = render(
      <AuthGuard>
        <div data-testid="protected-content">Protected</div>
      </AuthGuard>
    );

    // Look for the spinner
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
