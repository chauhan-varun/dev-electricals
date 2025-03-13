import api from './axios';
import { authApi } from './axios';

// Lazy loading pattern for Google authentication
let googleApiPromise = null;

// Function to get the appropriate Google client ID based on environment
const getGoogleClientId = () => {
  // For local development, use a test client ID that works with localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }
  
  // For production, use the configured client ID
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
};

// Function to load Google API script only once
const loadGoogleApi = () => {
  if (!googleApiPromise) {
    googleApiPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      document.head.appendChild(script);
    });
  }
  return googleApiPromise;
};

// Initialize Google authentication - updated for FedCM compatibility
export const initGoogleAuth = async (callback) => {
  try {
    const google = await loadGoogleApi();
    
    // Get the current origin for proper CORS configuration
    const origin = window.location.origin;
    
    // Updated configuration compatible with FedCM
    google.accounts.id.initialize({
      client_id: getGoogleClientId(),
      callback: callback,
      use_fedcm_for_prompt: true, // Enable FedCM
      ux_mode: 'popup',
    });
    
    return google;
  } catch (error) {
    console.error('Error initializing Google Auth:', error);
    throw error;
  }
};

// Process Google authentication token
export const processGoogleToken = async (token) => {
  try {
    // Use authApi instead of api for authentication routes
    const response = await authApi.post('/google', { token });
    
    // Store token
    localStorage.setItem('token', response.data.token);
    
    // Return user data
    return {
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    console.error('Google auth processing error:', error);
    throw error;
  }
};

// Get current user using token
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    // Use authApi instead of api for authentication routes
    const response = await authApi.get('/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    localStorage.removeItem('token');
    return null;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  // If using Google sign out as well
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.revoke();
  }
};
