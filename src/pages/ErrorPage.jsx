// src/pages/ErrorPage.jsx
import { useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming you have the Button component from ShadCN

const ErrorPage = () => {
  const error = useRouteError(); // Get error details
  console.error(error); // Log the error

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-3xl font-bold text-error">Oops! Something went wrong.</h1>
      <p className="mt-2">{error.statusText || error.message}</p>
      <Button
        variant="outline"
        className="mt-4 hover:bg-accent focus-visible:ring-ring"
        onClick={() => window.location.reload()}
      >
        Try Again
      </Button>
    </div>
  );
};

export default ErrorPage;
