// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/components/shared/NotificationSystem';
import router from '@/router';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { initializeDatabase } from '@/firebase/schema';

// Initialize the database schema
initializeDatabase()
  .then(() => {
    console.log('Database schema initialized');
  })
  .catch((error) => {
    console.error('Error initializing database schema:', error);
  });

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

