
import { Suspense, lazy, memo, useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ui/error-boundary";
import AppErrorHandler from "@/components/ui/AppErrorHandler";
import AppRoutes from "@/routes/AppRoutes";
import AuthStatusObserver from "@/components/auth/AuthStatusObserver";
import MobileBottomSheet from "@/components/layout/MobileBottomSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "sonner";
import RoutePreloader from "@/components/layout/RoutePreloader";
import LoadingFallback from "@/components/layout/LoadingFallback";
import { safeImport } from "@/utils/importUtils";

import "./App.css";

// Create a client with better error handling for failed imports
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2, // Reduce retries to avoid holding up the app
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 5000), // Faster retry with lower max
      staleTime: 60000, // 1 minute
    },
  },
});

// Add global error handler for queries
queryClient.getQueryCache().subscribe(event => {
  if (event.type === 'observerResultsUpdated' && event.query.state.error) {
    console.error("Query error:", event.query.state.error);
  }
});

// Memoized Toaster component
const MemoizedToaster = memo(Toaster);
MemoizedToaster.displayName = 'MemoizedToaster';

// Register error handler for chunk loading errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const error = event.error || event;
    // Check if this is a chunk loading error
    if (error && error.message && (
        error.message.includes('dynamically imported module') || 
        error.message.includes('Loading chunk') || 
        error.message.includes('Loading CSS chunk')
      )) {
      console.error('Chunk loading error detected:', error);
      // Attempt to recover by reloading the app
      if (!sessionStorage.getItem('chunkErrorRecoveryAttempted')) {
        console.log('Attempting to recover from chunk loading error...');
        sessionStorage.setItem('chunkErrorRecoveryAttempted', 'true');
        // Force full reload rather than just React re-render
        window.location.reload();
      }
    }
  });
}

// Skip preloading to avoid potential issues
const preloadCriticalComponents = () => {
  try {
    // Force load only most critical components
    import("@/pages/Auth").catch(() => {});
    import("@/pages/NotFound").catch(() => {});
  } catch (e) {
    console.error("Error in preload function:", e);
  }
};

// Start preloading immediately
preloadCriticalComponents();

// Optimized App component with memoization
const App = () => {
  // Track email cleanup state
  const emailCleanupDone = useRef(false);
  const isMobile = useIsMobile();
  
  // Add a mechanism to force progress if app is stuck
  useEffect(() => {
    const forceProgressTimeout = setTimeout(() => {
      if (!sessionStorage.getItem('appLoaded')) {
        console.log("Force loading app after timeout");
        sessionStorage.setItem('appLoaded', 'true');
      }
    }, 10000); // 10 second failsafe
    
    return () => clearTimeout(forceProgressTimeout);
  }, []);
  
  // Clean up any potential garbage from previous sessions - only run once
  useEffect(() => {
    if (emailCleanupDone.current) return;
    
    // Simplified cleanup function that is safer for DOM operations
    const cleanStrayContent = () => {
      // Skip if cleanup is already done
      if (emailCleanupDone.current) return;
      
      try {
        // First attempt: Remove any elements directly under the body that are not our app
        document.querySelectorAll('body > *:not(.app-container):not(#root):not(script):not(style):not(.sonner-toast-container)').forEach(el => {
          try {
            if (el && el.parentNode === document.body) {
              el.remove();
            }
          } catch (e) {
            console.error("Failed to remove element:", e);
          }
        });
        
        // Mark cleanup as done to prevent repeated attempts
        emailCleanupDone.current = true;
      } catch (e) {
        console.error("Error in cleanup function:", e);
        // Still mark as done to prevent repeated errors
        emailCleanupDone.current = true;
      }
    };
    
    // Run cleanup on mount after a small delay to ensure DOM is stable
    const initialCleanupTimeout = setTimeout(cleanStrayContent, 500);
    
    // Check if we need to recover from a previous error
    if (sessionStorage.getItem('chunkErrorRecoveryAttempted')) {
      console.log('Previously attempted to recover from chunk error, clearing flag');
      sessionStorage.removeItem('chunkErrorRecoveryAttempted');
    }
    
    // Cleanup on unmount
    return () => {
      clearTimeout(initialCleanupTimeout);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthStatusObserver />
          <AppErrorHandler />
          <RoutePreloader />
          <div className="app-container min-h-screen">
            {isMobile && <MobileBottomSheet />}
            <div className="content-container">
              <Suspense fallback={<LoadingFallback />}>
                <AppRoutes />
              </Suspense>
            </div>
          </div>
          <MemoizedToaster />
          <SonnerToaster position="bottom-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
