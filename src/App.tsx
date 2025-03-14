
import { Suspense, lazy } from "react"; // Added lazy import
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ui/error-boundary";
import AppErrorHandler from "@/components/ui/AppErrorHandler";
import AnimatedRoutes from "@/components/layout/AnimatedRoutes";
import AuthStatusObserver from "@/components/auth/AuthStatusObserver";
import LoadingFallback from "@/components/layout/LoadingFallback";

import "./App.css";

// Optimized App component with memoization
const App = () => {
  return (
    <>
      <BrowserRouter>
        <AuthStatusObserver />
        <AppErrorHandler />
        <Suspense fallback={<LoadingFallback />}>
          <div className="app-container">
            <AnimatedRoutes />
          </div>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </>
  );
};

export default App;
