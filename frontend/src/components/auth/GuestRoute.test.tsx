import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GuestRoute from './GuestRoute';

const mockUser = vi.hoisted(() => ({ current: null as any }));
const mockLoading = vi.hoisted(() => ({ current: false }));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: mockUser.current,
    loading: mockLoading.current,
  }),
}));

describe('GuestRoute', () => {
  beforeEach(() => {
    mockUser.current = null;
    mockLoading.current = false;
  });

  it('renders children when user is not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children prop when user is not logged in', () => {
    render(
      <MemoryRouter>
        <GuestRoute>
          <div>Guest Content</div>
        </GuestRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Guest Content')).toBeInTheDocument();
  });

  it('redirects to / when user is already logged in', () => {
    mockUser.current = { id: '1', email: 'test@test.com' };

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('shows loading spinner while auth is loading', () => {
    mockLoading.current = true;

    render(
      <MemoryRouter>
        <GuestRoute />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
