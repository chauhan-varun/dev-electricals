import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasShownToast, setHasShownToast] = useState(false);

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
        navigate('/signin');
      }
    };
    
    processGoogleToken();
  }, [navigate, login, hasShownToast]);
  
  // Show a prettier loading state that matches the image
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 right-0 bottom-0">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-6 bg-gray-400 rounded-full transform -translate-x-1/2"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: '1px 24px',
                animation: `spinLoader 1.2s linear infinite`,
                animationDelay: `${-0.1 * i}s`,
                opacity: 1 - (i * 0.075),
                rotate: `${i * 30}deg`
              }}
            />
          ))}
        </div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700">
        {isProcessing ? 'Processing your sign-in...' : 'Sign-in successful!'}
      </p>
      
      {/* Add animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinLoader {
          0% { opacity: 0.25; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default GoogleAuthCallback;
