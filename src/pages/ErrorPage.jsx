// src/pages/ErrorPage.jsx
import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-center">
      <div className="rounded-full bg-red-900/20 p-4">
        <AlertTriangle className="h-16 w-16 text-red-500" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-white">Oops!</h1>
      <p className="mt-3 text-xl text-gray-300">
        Sorry, an unexpected error has occurred.
      </p>
      <p className="mt-2 text-gray-400">
        {error?.statusText || error?.message || "Unknown error"}
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-8 flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
      >
        <Home className="h-5 w-5" />
        Back to Dashboard
      </button>
    </div>
  );
};

export default ErrorPage;
