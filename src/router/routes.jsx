// routes.jsx
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetails from "@/pages/CustomerDetails";
import Vehicles from "@/pages/Vehicles";
import VehicleDetails from "@/pages/VehicleDetails";
import Transactions from "@/pages/Transactions";
import SalesForm from "@/pages/SalesForm";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import ErrorPage from "@/pages/ErrorPage";
import { Navigate } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />, // Handles crashes, API failures, etc.
    children: [
      { index: true, element: <Dashboard /> }, // Default to Dashboard

      // Customer routes
      { path: "customers", element: <Customers /> }, // Customer list
      { path: "customers/new", element: <CustomerDetails /> }, // Add new customer
      { path: "customers/:id", element: <CustomerDetails /> }, // Edit existing customer

      // Vehicle routes
      { path: "vehicles", element: <Vehicles /> }, // Vehicle list
      { path: "vehicles/new", element: <VehicleDetails /> }, // Add new vehicle
      { path: "vehicles/:id", element: <VehicleDetails /> }, // Edit existing vehicle

      // Sales and transaction routes
      { path: "sales", element: <Transactions /> }, // View all sales/transactions
      { path: "sales/new", element: <SalesForm /> }, // New sale form (supports both cylinder and weight)
      { path: "transactions", element: <Transactions /> }, // Alias for sales
      { path: "transactions/new", element: <SalesForm /> }, // Can also be used for payments

      // Reports routes
      { path: "reports", element: <Reports /> }, // Reports and analytics

      // Redirects and fallbacks
      { path: "dashboard", element: <Navigate to="/" replace /> }, // Redirect to default
      { path: "*", element: <NotFound /> }, // 404 Not Found
    ],
  },
];

export default routes;
