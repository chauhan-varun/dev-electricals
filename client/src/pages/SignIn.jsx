import { useState } from 'react';
import api, { authApi } from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clear any existing toasts
    toast.dismiss();
    
    try {
      console.log('Attempting to sign in with:', { email: formData.email });
      
      // Use authApi instead of api since signin is an auth endpoint
      const response = await authApi.post('/signin', {
        email: formData.email,
        password: formData.password
      });
      
      console.log('Signin successful');
      
      // Store the JWT token
      localStorage.setItem('token', response.data.token);
      
      // Update auth context with user data
      login(response.data.user);
      
      // Show personalized welcome message
      toast.success(`Welcome back, ${response.data.user.name}!`, {
        position: 'top-center',
        duration: 4000,
        style: { background: '#10B981', color: 'white' }
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Signin error:', error);
      
      // Use the standard error message for authentication failures
      // This follows the memory specification for security (not revealing specific failure)
      toast.error('Incorrect credentials', {
        position: 'top-center',
        duration: 4000,
        style: { background: '#EF4444', color: 'white' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful Google auth - no toast needed as GoogleAuthCallback already shows one
  const handleGoogleAuthSuccess = (data) => {
    // Update auth context with user data
    login(data.user);
    // Just navigate without showing a redundant notification
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary pr-10"
            />
            <button 
              type="button" 
              className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-600 hover:text-gray-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                /* Hide password icon (eye-slash) */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                /* Show password icon (eye) */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        
        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>
        
        {/* Google Sign In Button */}
        <GoogleAuthButton onSuccess={handleGoogleAuthSuccess} />
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;