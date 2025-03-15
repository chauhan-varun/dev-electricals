import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../utils/axios';
import Loader from '../components/UI/Loader';

// Flag to use simulation mode (set to false to use real Google auth)
const USE_SIMULATION = false;

const GoogleAuthButton = ({ buttonText = "Sign in with Google", onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Direct Google OAuth flow without relying on Google Identity Services
  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      // For simulation mode only in development
      if (USE_SIMULATION && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        // Simulate a successful login in development
        toast.success('Simulated Google sign-in success in development mode', {
          position: 'top-center',
          duration: 4000,
          style: { background: '#10B981', color: 'white' }
        });
        
        // Create a mock user
        const mockUser = {
          id: 'google-user-123',
          name: 'Test User',
          email: 'test@example.com',
          profilePicture: 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff'
        };
        
        // Store a mock token
        localStorage.setItem('token', 'mock-token-for-development');
        
        if (onSuccess) {
          onSuccess({ token: 'mock-token-for-development', user: mockUser });
        } else {
          navigate('/');
        }
        
        setIsLoading(false);
        return;
      }

      // Simpler approach: direct to Google login with proper callback URL
      // This matches the route we defined in App.jsx
      window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
        new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          redirect_uri: `${window.location.origin}/auth/google/callback`,
          response_type: 'token',
          scope: 'email profile',
          prompt: 'select_account',
          access_type: 'online',
        }).toString();
      
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Error with Google sign-in. Please try again.', {
        position: 'top-center',
        duration: 4000,
        style: { background: '#EF4444', color: 'white' }
      });
      setIsLoading(false);
    }
  };

  // Render the Google sign-in button with specified styling from memory
  return (
    <button 
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center w-full h-10 mt-4 rounded-md overflow-hidden relative"
      style={{ backgroundColor: '#4285F4' }}
      aria-label="Sign in with Google"
      type="button" // Explicitly set as button type to prevent form submission
    >
      {!isLoading && (
        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-white">
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        </div>
      )}
      <span className="flex-grow text-white font-medium ml-3 flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader size={20} color="#FFFFFF" />
            <span className="ml-2">Signing in...</span>
          </div>
        ) : buttonText}
      </span>
    </button>
  );
};

export default GoogleAuthButton;
