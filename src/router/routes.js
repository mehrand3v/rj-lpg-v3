
import NotFound from "@/pages/NotFound";
import ErrorPage from "@/pages/ErrorPage";
// Ensure that your routes are passed to a React Router component
import { Navigate } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />, // Handles crashes, API failures, etc.
    children: [
      { index: true, element: <Dashboard /> }, // Default to  Dashboard
      { path: "customers", element: <Customers /> }, // Customer list
      { path: "sales", element: <Sales /> }, // Sales list

      { path: "dashboard", element: <Navigate to="/" replace /> }, // Redirect to default
      { path: "*", element: <NotFound /> }, // 404 Not Found
    ],
  },
];

export default routes;
