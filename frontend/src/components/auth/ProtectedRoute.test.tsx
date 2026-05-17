import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

// Mock useAuthStore — use vi.hoisted for test-scoped control
const mockUser = vi.hoisted(() => ({ current: null as any }));
const mockLoading = vi.hoisted(() => ({ current: false }));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: mockUser.current,
    loading: mockLoading.current,
  }),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUser.current = null;
    mockLoading.current = false;
  });

  it('renders children when user is logged in', () => {
    mockUser.current = { id: '1', email: 'test@test.com' };

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children prop when user is logged in', () => {
    mockUser.current = { id: '1', email: 'test@test.com' };

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Child Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('redirects to /login when user is not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading spinner while auth is loading', () => {
    mockLoading.current = true;

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
