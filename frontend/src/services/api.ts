import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    `http://localhost:${import.meta.env.VITE_PORT || 3001}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Just clear token, App will handle redirect via ProtectedRoute
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  },
);

export default api;
