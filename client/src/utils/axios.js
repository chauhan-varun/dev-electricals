import axios from 'axios';

// Base API client for regular API endpoints
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Auth API client for authentication endpoints
const authApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for main API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Request interceptor for auth API
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Auth API request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for main API
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API response error:", error.response || error);
    
    // If the error is due to an expired token, you can handle token refresh here
    // For now, we're just propagating the error
    return Promise.reject(error);
  }
);

// Response interceptor for auth API
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("Auth API response error:", error.response || error);
    
    // If the error is due to an expired token, you can handle token refresh here
    // For now, we're just propagating the error
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export { authApi };
export default api;