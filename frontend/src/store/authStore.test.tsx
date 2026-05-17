import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/services/api';
import { useAuthStore } from './authStore';

const mockUser = { id: '1', email: 'test@test.com', username: 'testuser', createdAt: '2024-01-01' };
const mockToken = 'fake-jwt-token';

const TestAuth = () => {
  const { user, token, loading, error, login, register, logout } = useAuthStore();
  const [msg, setMsg] = useState('');

  const handleLogin = async () => {
    try {
      await login('test@test.com', 'password');
      setMsg('login-ok');
    } catch {
      setMsg('login-fail');
    }
  };

  const handleRegister = async () => {
    try {
      await register('testuser', 'test@test.com', 'password');
      setMsg('register-ok');
    } catch {
      setMsg('register-fail');
    }
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="user">{user?.email || 'no-user'}</span>
      <span data-testid="token">{token || 'no-token'}</span>
      <span data-testid="error">{error || 'no-error'}</span>
      <span data-testid="msg">{msg}</span>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      loading: false,
      error: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });

  it('login sets user and token on success', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(api.post).mockResolvedValue({ data: { user: mockUser, token: mockToken } });

    render(<TestAuth />);

    await userEvt.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    expect(localStorage.getItem('access_token')).toBe(mockToken);
    expect(screen.getByTestId('msg')).toHaveTextContent('login-ok');
  });

  it('login sets error and re-throws on failure', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    render(<TestAuth />);

    await userEvt.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
    expect(screen.getByTestId('msg')).toHaveTextContent('login-fail');
  });

  it('register sets user and token on success', async () => {
    const userEvt = userEvent.setup();
    vi.mocked(api.post).mockResolvedValue({ data: { user: mockUser, token: mockToken } });

    render(<TestAuth />);

    await userEvt.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
    expect(localStorage.getItem('access_token')).toBe(mockToken);
    expect(screen.getByTestId('msg')).toHaveTextContent('register-ok');
  });

  it('logout clears user, token, and localStorage', async () => {
    const userEvt = userEvent.setup();
    localStorage.setItem('access_token', mockToken);
    useAuthStore.setState({
      token: mockToken,
      user: mockUser,
      loading: false,
    });

    render(<TestAuth />);

    expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);

    await userEvt.click(screen.getByText('Logout'));

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
