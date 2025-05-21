
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { HomeIcon, AlertTriangleIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md text-center">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">Page not found</p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link to="/" className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="javascript:history.back()" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Path: <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded">{location.pathname}</code>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
