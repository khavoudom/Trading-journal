import { create } from 'zustand';
import api from '@/services/api';

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  timezone: string;
  setTimezone: (tz: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const initialToken = localStorage.getItem('access_token');
const initialTimezone =
  localStorage.getItem('selected_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: initialToken,
  loading: !!initialToken,
  error: null,
  timezone: initialTimezone,

  setTimezone: (tz: string) => {
    localStorage.setItem('selected_timezone', tz);
    set({ timezone: tz });
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('access_token', token);
      set({ user, token, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user, token } = response.data;
      localStorage.setItem('access_token', token);
      set({ user, token, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, error: null });
  },

  refreshProfile: async () => {
    const currentToken = localStorage.getItem('access_token');
    if (!currentToken) {
      set({ loading: false });
      return;
    }
    try {
      const response = await api.get('/auth/profile');
      set({ user: response.data.user, token: currentToken, loading: false });
    } catch {
      localStorage.removeItem('access_token');
      set({ user: null, token: null, loading: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch('/auth/profile', data);
      set({ user: response.data.user, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update profile';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteAccount: async (password: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete('/auth/profile', { data: { password } });
      localStorage.removeItem('access_token');
      set({ user: null, token: null, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete account';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },
}));
