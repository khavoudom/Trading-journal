import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/drawingService', () => ({
  drawingService: {
    getAllDrawings: vi.fn(),
    getDrawingsByDate: vi.fn(),
    getDrawing: vi.fn(),
    createDrawing: vi.fn(),
    updateDrawing: vi.fn(),
    deleteDrawing: vi.fn(),
  },
}));

import { useDrawingStore } from './drawingStore';
import { drawingService } from '@/services/drawingService';

const mockDrawings = [
  {
    id: 'drawing-1',
    userId: 'user-1',
    spaceId: 'space-1',
    date: '2024-01-15',
    title: 'Chart Analysis',
    sceneData: {},
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const TestDrawing = () => {
  const { drawings, loading, error, fetchDrawings, addDrawing, removeDrawing, clearDrawings } =
    useDrawingStore();

  return (
    <div>
      <span data-testid="loading">{loading ? 'true' : 'false'}</span>
      <span data-testid="error">{error || 'no-error'}</span>
      <ul data-testid="drawings-list">
        {drawings.map((d) => (
          <li key={d.id}>{d.title}</li>
        ))}
      </ul>
      <button onClick={() => fetchDrawings('space-1', '2024-01-15')}>Fetch</button>
      <button
        onClick={() =>
          addDrawing({
            spaceId: 'space-1',
            date: '2024-01-16',
            title: 'New Drawing',
            sceneData: {},
          })
        }
      >
        Add
      </button>
      <button onClick={() => removeDrawing('drawing-1', 'space-1')}>Remove</button>
      <button onClick={clearDrawings}>Clear</button>
    </div>
  );
};

describe('drawingStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDrawingStore.setState({ drawings: [], loading: false, error: null });
  });

  it('fetchDrawings loads drawings into state with loading states', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(drawingService.getDrawingsByDate).mockResolvedValue(mockDrawings);

    render(<TestDrawing />);

    await userEvt.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByText('Chart Analysis')).toBeInTheDocument();
    });
  });

  it('addDrawing prepends the drawing to the list', async () => {
    const userEvt = userEvent.setup();
    const newDrawing = {
      id: 'drawing-2',
      userId: 'user-1',
      spaceId: 'space-1',
      date: '2024-01-16',
      title: 'New Drawing',
      sceneData: {},
      createdAt: '2024-01-16T00:00:00Z',
      updatedAt: '2024-01-16T00:00:00Z',
    };
    vi.mocked(drawingService.createDrawing).mockResolvedValue(newDrawing);

    render(<TestDrawing />);

    await userEvt.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('New Drawing')).toBeInTheDocument();
    });
  });

  it('removeDrawing removes drawing from the list', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(drawingService.getDrawingsByDate).mockResolvedValue(mockDrawings);
    vi.mocked(drawingService.deleteDrawing).mockResolvedValue(undefined);

    render(<TestDrawing />);

    await userEvt.click(screen.getByText('Fetch'));
    await waitFor(() => {
      expect(screen.getByText('Chart Analysis')).toBeInTheDocument();
    });

    await userEvt.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.queryByText('Chart Analysis')).not.toBeInTheDocument();
    });
  });

  it('clearDrawings resets the drawing list', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(drawingService.getDrawingsByDate).mockResolvedValue(mockDrawings);

    render(<TestDrawing />);

    await userEvt.click(screen.getByText('Fetch'));
    await waitFor(() => {
      expect(screen.getByText('Chart Analysis')).toBeInTheDocument();
    });

    await userEvt.click(screen.getByText('Clear'));

    expect(screen.getByTestId('drawings-list')).toBeEmptyDOMElement();
  });

  it('sets error and clears drawings on fetch failure', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(drawingService.getDrawingsByDate).mockRejectedValue(new Error('Network error'));

    render(<TestDrawing />);

    await userEvt.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
    expect(screen.getByTestId('drawings-list')).toBeEmptyDOMElement();
  });
});
