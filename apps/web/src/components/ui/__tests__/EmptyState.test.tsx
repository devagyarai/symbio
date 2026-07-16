import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { Search } from 'lucide-react';
import userEvent from '@testing-library/user-event';

describe('EmptyState Component', () => {
  it('renders title and description correctly', () => {
    render(
      <EmptyState
        icon={Search}
        title="No results"
        description="Try a different search term"
      />
    );

    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try a different search term')).toBeInTheDocument();
  });

  it('renders action button and handles click', async () => {
    const handleAction = jest.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        icon={Search}
        title="No results"
        description="Try a different search term"
        action={{
          label: 'Clear Search',
          onClick: handleAction,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Clear Search' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
