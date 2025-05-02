import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, logout } from '../utils/auth';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Handle user logout
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    // Notification will be handled by the component that calls this
    // Navigation will be handled by the component that calls this method
  };

  // Handle user login (used after standard email/password login)
  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
