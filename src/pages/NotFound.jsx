// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming you have the Button component from ShadCN

function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-accent">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-muted mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="w-full">
          <Button
            variant="gradient"
            className="px-6 py-3 bg-accent rounded-lg w-full hover:bg-accent-light focus-visible:ring-ring transition-all duration-300"
          >
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
