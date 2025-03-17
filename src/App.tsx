
import { Suspense, lazy, memo, useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ui/error-boundary";
import AppErrorHandler from "@/components/ui/AppErrorHandler";
import AnimatedRoutes from "@/components/layout/AnimatedRoutes";
import AuthStatusObserver from "@/components/auth/AuthStatusObserver";
import LoadingFallback from "@/components/layout/LoadingFallback";
import { Toaster as SonnerToaster } from "sonner";

import "./App.css";

// Memoized LoadingFallback to prevent unnecessary renders
const MemoizedLoadingFallback = memo(LoadingFallback);
MemoizedLoadingFallback.displayName = 'MemoizedLoadingFallback';

// Memoized Toaster component
const MemoizedToaster = memo(Toaster);
MemoizedToaster.displayName = 'MemoizedToaster';

// Optimized App component with memoization
const App = () => {
  // Track email cleanup state
  const emailCleanupDone = useRef(false);
  
  // Clean up any potential garbage from previous sessions - only run once
  useEffect(() => {
    if (emailCleanupDone.current) return;
    
    // Function to clean up any stray DOM elements not managed by React
    const cleanStrayContent = () => {
      // Skip if cleanup is already done
      if (emailCleanupDone.current) return;
      
      // First attempt: Remove any elements directly under the body that are not our app
      document.querySelectorAll('body > *:not(.app-container):not(#root):not(script):not(style):not(.sonner-toast-container)').forEach(el => {
        console.log("Removing stray element:", el.tagName);
        el.remove();
      });
      
      // Email regex pattern
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      let emailsRemoved = 0;
      
      // Walk the DOM and look for text nodes with emails outside our app container
      const walkDOM = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (emailRegex.test(node.textContent)) {
            // Check if this node is not inside our app containers
            let parent = node.parentNode;
            let isInsideApp = false;
            
            while (parent && parent !== document.body) {
              if (parent.classList?.contains('app-container') || 
                  parent.id === 'root' || 
                  parent.classList?.contains('sonner-toast-container') ||
                  parent.classList?.contains('page-transition')) {
                isInsideApp = true;
                break;
              }
              parent = parent.parentNode;
            }
            
            if (!isInsideApp) {
              console.log("Removing orphaned email text node:", node.textContent.trim());
              node.textContent = "";
              emailsRemoved++;
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(walkDOM);
        }
      };
      
      // Start from body
      walkDOM(document.body);
      
      if (emailsRemoved === 0) {
        // If no emails were found, we can mark cleanup as done
        emailCleanupDone.current = true;
        console.log("Email cleanup complete - no emails found");
      } else {
        console.log(`Removed ${emailsRemoved} email references`);
      }
    };
    
    // Run cleanup on mount with a delay to ensure DOM is loaded
    const initialCleanupTimeout = setTimeout(cleanStrayContent, 200);
    
    // Run cleanup again after 1 second to catch any late-appearing content
    const secondCleanupTimeout = setTimeout(cleanStrayContent, 1000);
    
    // Final cleanup check
    const finalCleanupTimeout = setTimeout(() => {
      cleanStrayContent();
      emailCleanupDone.current = true;
    }, 2000);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(initialCleanupTimeout);
      clearTimeout(secondCleanupTimeout);
      clearTimeout(finalCleanupTimeout);
    };
  }, []);
  
  return (
    <BrowserRouter>
      <AuthStatusObserver />
      <AppErrorHandler />
      <Suspense fallback={<MemoizedLoadingFallback />}>
        <div className="app-container">
          <AnimatedRoutes />
        </div>
      </Suspense>
      <MemoizedToaster />
      <SonnerToaster position="bottom-right" />
    </BrowserRouter>
  );
};

export default App;
