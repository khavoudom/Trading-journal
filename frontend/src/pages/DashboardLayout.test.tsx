import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Mock @base-ui/react/select since it needs DOM features not available in jsdom
vi.mock('@base-ui/react/select', () => {
  const MockSelect = ({ children }: any) => <>{children}</>;
  const primitive = {
    Root: MockSelect,
    Trigger: ({ children, render, ...props }: any) => <button {...props}>{children}</button>,
    Value: ({ children }: any) => <>{children}</>,
    Popup: ({ children }: any) => <>{children}</>,
    Positioner: ({ children }: any) => <>{children}</>,
    Portal: ({ children }: any) => <>{children}</>,
    List: ({ children }: any) => <>{children}</>,
    Icon: () => null,
    Item: ({ value, children, render: _render }: any) => <div data-value={value}>{children}</div>,
    ItemText: ({ children }: any) => <>{children}</>,
    ItemIndicator: () => null,
    Group: ({ children }: any) => <>{children}</>,
    GroupLabel: ({ children }: any) => <>{children}</>,
    Separator: () => null,
    ScrollUpArrow: () => null,
    ScrollDownArrow: () => null,
  };
  return {
    Select: Object.assign(MockSelect, primitive),
    SelectTrigger: primitive.Trigger,
    SelectValue: primitive.Value,
    SelectContent: primitive.Popup,
    SelectItem: primitive.Item,
    SelectGroup: primitive.Group,
    SelectLabel: primitive.GroupLabel,
    SelectSeparator: primitive.Separator,
    SelectScrollUpButton: primitive.ScrollUpArrow,
    SelectScrollDownButton: primitive.ScrollDownArrow,
    SelectPopup: primitive.Popup,
    SelectPositioner: primitive.Positioner,
    SelectPortal: primitive.Portal,
    SelectList: primitive.List,
    SelectIcon: primitive.Icon,
    SelectItemText: primitive.ItemText,
    SelectItemIndicator: primitive.ItemIndicator,
    SelectGroupLabel: primitive.GroupLabel,
    SelectPrimitive: primitive,
  };
});

// Mock @base-ui/react/dialog
vi.mock('@base-ui/react/dialog', () => {
  const MockDialog = ({ children, open = false, onOpenChange: _onOpenChange }: any) => {
    if (!open) return null;
    return <div data-testid="mock-dialog">{children}</div>;
  };
  const primitive = {
    Root: MockDialog,
    Trigger: ({ children }: any) => <>{children}</>,
    Close: ({ children, render, ...props }: any) => <button {...props}>{children}</button>,
    Portal: ({ children }: any) => <>{children}</>,
    Popup: ({ children }: any) => <>{children}</>,
    Backdrop: () => null,
    Title: ({ children }: any) => <>{children}</>,
    Description: ({ children }: any) => <>{children}</>,
  };
  return {
    Dialog: Object.assign(MockDialog, primitive),
    DialogTrigger: primitive.Trigger,
    DialogClose: primitive.Close,
    DialogPortal: primitive.Portal,
    DialogContent: primitive.Popup,
    DialogOverlay: primitive.Backdrop,
    DialogTitle: primitive.Title,
    DialogDescription: primitive.Description,
  };
});

// Mock stores
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', email: 'test@test.com', username: 'testuser', createdAt: '2024-01-01' },
    logout: vi.fn(),
    timezone: 'UTC',
    setTimezone: vi.fn(),
  })),
}));

vi.mock('@/store/spaceStore', () => ({
  useSpaceStore: vi.fn(() => ({
    spaces: [{ id: 'test', name: 'Test Space' }],
    currentSpaceId: 'test',
    createSpace: vi.fn(),
  })),
}));

describe('DashboardLayout', () => {
  it('renders children via outlet', () => {
    render(
      <MemoryRouter initialEntries={['/space/test/dashboard']}>
        <Routes>
          <Route path="/space/:spaceId" element={<DashboardLayout />}>
            <Route path="dashboard" element={<div>Main Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Main Content/i)).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(
      <MemoryRouter initialEntries={['/space/test/portfolio']}>
        <Routes>
          <Route path="/space/:spaceId" element={<DashboardLayout />}>
            <Route path="portfolio" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/Trade Log/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Analytics/i)[0]).toBeInTheDocument();
  });

  it('renders "New Trade" button', () => {
    render(
      <MemoryRouter initialEntries={['/space/test/portfolio']}>
        <Routes>
          <Route path="/space/:spaceId" element={<DashboardLayout />}>
            <Route path="portfolio" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/New Trade/i)).toBeInTheDocument();
  });
});
