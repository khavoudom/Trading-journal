import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/spaceService', () => ({
  spaceService: {
    getSpaces: vi.fn(),
    createSpace: vi.fn(),
    deleteSpace: vi.fn(),
    renameSpace: vi.fn(),
  },
}));

import { spaceService } from '@/services/spaceService';
import { useSpaceStore } from './spaceStore';

const mockSpaces = [
  { id: 'space-1', name: 'Main Account', userId: 'user-1', createdAt: '2024-01-01' },
  { id: 'space-2', name: 'Test Account', userId: 'user-1', createdAt: '2024-01-02' },
];

// Test component that exposes space store state
const TestSpaces = () => {
  const { spaces, currentSpaceId, loading, error, fetchSpaces, createSpace, deleteSpace } =
    useSpaceStore();

  return (
    <div>
      <span data-testid="loading">{loading ? 'true' : 'false'}</span>
      <span data-testid="error">{error || 'no-error'}</span>
      <span data-testid="current-space">{currentSpaceId || 'none'}</span>
      <ul data-testid="spaces-list">
        {spaces.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
      <button onClick={() => fetchSpaces()}>Fetch</button>
      <button onClick={() => createSpace('New Space')}>Create</button>
      <button onClick={() => deleteSpace('space-1', 'password')}>Delete First</button>
    </div>
  );
};

describe('spaceStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useSpaceStore.setState({
      spaces: [],
      currentSpaceId: null,
      loading: false,
      error: null,
    });
  });

  it('fetches and displays spaces on fetchSpaces call', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(spaceService.getSpaces).mockResolvedValue(mockSpaces);

    render(<TestSpaces />);

    await userEvt.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByText('Main Account')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Account')).toBeInTheDocument();
    expect(spaceService.getSpaces).toHaveBeenCalled();
  });

  it('auto-selects first space and persists to localStorage on fetch', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(spaceService.getSpaces).mockResolvedValue(mockSpaces);

    render(<TestSpaces />);

    await userEvt.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByText('Main Account')).toBeInTheDocument();
    });

    expect(localStorage.getItem('currentSpaceId')).toBe('space-1');
  });

  it('appends new space on createSpace', async () => {
    const userEvt = userEvent.setup();
    const newSpace = {
      id: 'space-3',
      name: 'New Space',
      userId: 'user-1',
      createdAt: '2024-01-03',
    };
    vi.mocked(spaceService.createSpace).mockResolvedValue(newSpace);

    render(<TestSpaces />);

    await userEvt.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('New Space')).toBeInTheDocument();
    });
  });

  it('removes space and auto-switches currentSpaceId on delete', async () => {
    const userEvt = userEvent.setup();
    // Pre-populate store with spaces
    useSpaceStore.setState({
      spaces: mockSpaces as any,
      currentSpaceId: 'space-1',
    });
    vi.mocked(spaceService.deleteSpace).mockResolvedValue(undefined);

    render(<TestSpaces />);

    expect(screen.getByText('Main Account')).toBeInTheDocument();
    expect(screen.getByTestId('current-space')).toHaveTextContent('space-1');

    await userEvt.click(screen.getByText('Delete First'));

    await waitFor(() => {
      expect(screen.queryByText('Main Account')).not.toBeInTheDocument();
    });

    // Should have switched to next available space
    expect(screen.getByTestId('current-space')).toHaveTextContent('space-2');
  });
});
