import { createContext, useContext, useState } from 'react';
import CustomNotification from '../components/UI/CustomNotification';

const NotificationContext = createContext();

/**
 * NotificationProvider component for handling global notifications
 * Replaces react-hot-toast with a more attractive custom implementation
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (type, message, duration = 4000) => {
    // Check if a notification with the same message already exists
    const isDuplicate = notifications.some(notification => 
      notification.message === message && notification.type === type
    );
    
    // Only add the notification if it's not a duplicate
    if (!isDuplicate) {
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { id, type, message, duration }]);
      return id;
    }
    return null;
  };

  const hideNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Convenience methods
  const showSuccess = (message, duration) => showNotification('success', message, duration);
  const showError = (message, duration) => showNotification('error', message, duration);
  const showInfo = (message, duration) => showNotification('info', message, duration);

  return (
    <NotificationContext.Provider 
      value={{ showSuccess, showError, showInfo, showNotification, hideNotification }}
    >
      {children}
      
      {/* Render the notifications */}
      {notifications.map(notification => (
        <CustomNotification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
}

// Custom hook for using notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
