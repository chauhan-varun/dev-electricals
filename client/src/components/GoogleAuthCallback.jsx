import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Loader from '../components/UI/Loader';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  // Use refs instead of state to prevent re-renders
  const hasShownSuccessRef = useRef(false);
  const hasShownErrorRef = useRef(false);

  useEffect(() => {
    // Process the Google authentication
    
    const processGoogleToken = async () => {
      try {
        // Check if we have a token in the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          if (!hasShownErrorRef.current) {
            showError('Authentication failed. No token received from Google.', 5000);
            hasShownErrorRef.current = true;
          }
          navigate('/signin');
          return;
        }
        
        console.log('Got access token from Google, sending to backend...');
        
        // Process the token with the backend
        setIsProcessing(true);
        const response = await authApi.post('/google', { token: accessToken });
        
        // Extract user data
        const { token, user } = response.data;
        
        // Store the JWT token from our backend
        localStorage.setItem('token', token);
        
        // Update auth context with the user data
        login(user);
        
        // Show personalized welcome message with user's name only once
        if (!hasShownSuccessRef.current) {
          showSuccess(`Welcome, ${user.name}!`, 5000);
          hasShownSuccessRef.current = true;
        }
        
        // Allow the loading spinner to show before redirecting
        setTimeout(() => {
          setIsProcessing(false);
          // Redirect to home
          navigate('/');
        }, 1000);
        
      } catch (error) {
        console.error('Error processing Google token:', error);
        // Clear any stored token and logout
        localStorage.removeItem('token');
        
        // Extract the most useful error message
        let errorMessage = 'Error with Google authentication';
        
        if (error.response) {
          console.error('Server response error:', {
            status: error.response.status,
            data: error.response.data
          });
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.request) {
          console.error('No response received from server');
          errorMessage = 'Server is not responding. Please try again later.';
        } else {
          console.error('Error setting up request:', error.message);
          errorMessage = 'Failed to send authentication request. Please try again.';
        }
        
        if (!hasShownErrorRef.current) {
          showError(errorMessage, 6000);
          hasShownErrorRef.current = true;
        }
        
        setIsProcessing(false);
        setErrorMessage(errorMessage);
        
        // Redirect to signin page after a brief delay to allow the error message to be seen
        setTimeout(() => {
          navigate('/signin');
        }, 5000);
      }
    };
    
    processGoogleToken();
  }, [navigate, login]);
  
  // Add cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Reset refs when component unmounts
      hasShownSuccessRef.current = false;
      hasShownErrorRef.current = false;
    };
  }, []);
  
  // Render loading state while processing or fallback message on error  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        {isProcessing ? (
          <>
            <div className="flex flex-col items-center justify-center">
              <Loader size={60} />
              <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
                Processing your login
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please wait while we authenticate your account...
              </p>
            </div>
          </>
        ) : errorMessage ? (
          <>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Authentication failed:</strong>
              <span className="block sm:inline"> {errorMessage}</span>
            </div>
            <button
              onClick={() => navigate('/signin')}
              className="mt-4 group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Sign In
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
