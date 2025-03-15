import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/UI/Loader';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Clear any existing toasts to prevent duplicates
    toast.dismiss();
    
    const processGoogleToken = async () => {
      try {
        // Check if we have a token in the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          if (!hasShownToast) {
            toast.error('Authentication failed. Please try again.', {
              position: 'top-center',
              duration: 4000,
              style: { background: '#EF4444', color: 'white' }
            });
            setHasShownToast(true);
          }
          navigate('/signin');
          return;
        }
        
        // Process the token with the backend
        const response = await authApi.post('/google', { token: accessToken });
        
        // Extract user data
        const { token, user } = response.data;
        
        // Store the JWT token from our backend
        localStorage.setItem('token', token);
        
        // Update auth context with the user data
        login(user);
        
        // Show personalized welcome message with user's name only once
        if (!hasShownToast) {
          toast.success(`Welcome, ${user.name}!`, {
            position: 'top-center',
            duration: 4000,
            style: { background: '#10B981', color: 'white' }
          });
          setHasShownToast(true);
        }
        
        // Allow the loading spinner to show before redirecting
        setTimeout(() => {
          setIsProcessing(false);
          // Redirect to home
          navigate('/');
        }, 1000);
        
      } catch (error) {
        console.error('Error processing Google token:', error);
        if (!hasShownToast) {
          toast.error(error.response?.data?.message || 'Error with Google authentication', {
            position: 'top-center',
            duration: 4000,
            style: { background: '#EF4444', color: 'white' }
          });
          setHasShownToast(true);
        }
        setIsProcessing(false);
        setErrorMessage(error.response?.data?.message || 'Error with Google authentication');
      }
    };
    
    processGoogleToken();
  }, [navigate, login, hasShownToast]);
  
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
