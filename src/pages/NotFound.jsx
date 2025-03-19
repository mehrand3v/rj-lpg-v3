// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-900 p-4 text-center">
      <div className="rounded-full bg-indigo-900/20 p-4">
        <Search className="h-16 w-16 text-indigo-400" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-white">Page Not Found</h1>
      <p className="mt-3 max-w-md text-xl text-gray-300">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 text-white hover:bg-gray-700"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
        >
          <Home className="h-5 w-5" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
