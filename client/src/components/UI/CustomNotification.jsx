import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

/**
 * CustomNotification component for displaying beautiful notifications
 * @param {Object} props Component props
 * @param {string} props.type 'success' or 'error'
 * @param {string} props.message The message to display
 * @param {number} props.duration Duration in ms before auto-closing
 * @param {function} props.onClose Callback when notification is closed
 */
const CustomNotification = ({ type = 'success', message, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300); // Give time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Define colors based on type
  const colors = {
    success: {
      background: 'bg-green-50',
      border: 'border-green-500',
      icon: 'text-green-500',
      text: 'text-green-800'
    },
    error: {
      background: 'bg-red-50',
      border: 'border-red-500',
      icon: 'text-red-500',
      text: 'text-red-800'
    },
    info: {
      background: 'bg-blue-50',
      border: 'border-blue-500',
      icon: 'text-blue-500',
      text: 'text-blue-800'
    }
  };

  const colorScheme = colors[type] || colors.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full shadow-lg rounded-lg overflow-hidden ${colorScheme.background} border ${colorScheme.border}`}
        >
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0">
              {type === 'success' ? (
                <CheckCircleIcon className={`h-6 w-6 ${colorScheme.icon}`} />
              ) : (
                <XCircleIcon className={`h-6 w-6 ${colorScheme.icon}`} />
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${colorScheme.text}`}>{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex ${colorScheme.text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                onClick={() => setIsVisible(false)}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`h-1 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomNotification;
