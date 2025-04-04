// src/router/index.js
import { createBrowserRouter } from 'react-router-dom';
// At the top of src/router/index.js
import React from 'react';
// Layouts
import RootLayout from '@/components/layout/RootLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/CustomerDetail';
import CustomerForm from '@/pages/CustomerForm';
import Sales from '@/pages/Sales';
import SaleDetail from '@/pages/SaleDetail';
import SaleForm from '@/pages/SaleForm';
import Payments from '@/pages/Payments';
import PaymentDetail from '@/pages/PaymentDetail';
import PaymentForm from '@/pages/PaymentForm';
import Cylinders from '@/pages/Cylinders';
import CylinderReturns from '@/pages/CylinderReturns';
import VehicleForm from '@/pages/VehicleForm';
import Reports from '@/pages/Reports';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import ErrorPage from '@/pages/ErrorPage';

// Protected route wrapper
import ProtectedRoute from './ProtectedRoute';

// Auth check function - use from the correct path
import { getCurrentUser } from '@/firebase/auth';

// Auth check function
const authGuard = async () => {
  // const user = getCurrentUser();
  // if (!user) {
  //   throw new Error('Unauthorized');
  // }
  return null;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        loader: authGuard
      },
      // Customers routes
      {
        path: 'customers',
        element: <Customers />,
        loader: authGuard
      },
      {
        path: 'customers/:id',
        element: <CustomerDetail />,
        loader: authGuard
      },
      {
        path: 'customers/new',
        element: <CustomerForm />,
        loader: authGuard
      },
      {
        path: 'customers/edit/:id',
        element: <CustomerForm isEdit />,
        loader: authGuard
      },
      // Sales routes
      {
        path: 'sales',
        element: <Sales />,
        loader: authGuard
      },
      {
        path: 'sales/:id',
        element: <SaleDetail />,
        loader: authGuard
      },
      {
        path: 'sales/new',
        element: <SaleForm />,
        loader: authGuard
      },
      {
        path: 'sales/edit/:id',
        element: <SaleForm isEdit />,
        loader: authGuard
      },
      // Payments routes
      {
        path: 'payments',
        element: <Payments />,
        loader: authGuard
      },
      {
        path: 'payments/:id',
        element: <PaymentDetail />,
        loader: authGuard
      },
      {
        path: 'payments/new',
        element: <PaymentForm />,
        loader: authGuard
      },
      {
        path: 'payments/edit/:id',
        element: <PaymentForm isEdit />,
        loader: authGuard
      },
      // Cylinders routes
      {
        path: 'cylinders',
        element: <Cylinders />,
        loader: authGuard
      },
      {
        path: 'cylinders/returns',
        element: <CylinderReturns />,
        loader: authGuard
      },
      // Vehicles routes
      {
        path: 'vehicles/new',
        element: <VehicleForm />,
        loader: authGuard
      },
      {
        path: 'vehicles/edit/:id',
        element: <VehicleForm isEdit />,
        loader: authGuard
      },
      // Reports routes
      {
        path: 'reports',
        element: <Reports />,
        loader: authGuard
      },
      // Catch-all route
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

export default router;