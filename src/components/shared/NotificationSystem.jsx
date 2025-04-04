// src/components/shared/NotificationSystem.jsx
import { createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';

// Create notification context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  // Success notification
  const success = (message, options = {}) => {
    return toast.success(message, options);
  };

  // Error notification
  const error = (message, options = {}) => {
    return toast.error(message, options);
  };

  // Warning notification
  const warning = (message, options = {}) => {
    return toast.warning(message, options);
  };

  // Info notification
  const info = (message, options = {}) => {
    return toast.info(message, options);
  };

  // Promise notification (for async operations)
  const promise = (promise, messages, options = {}) => {
    return toast.promise(promise, messages, options);
  };

  // Custom notification
  const custom = (message, options = {}) => {
    return toast(message, options);
  };

  // Context value
  const value = {
    success,
    error,
    warning,
    info,
    promise,
    custom
  };

  return (
    <NotificationContext.Provider value={value}>
      {/* Sonner Toaster component */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};