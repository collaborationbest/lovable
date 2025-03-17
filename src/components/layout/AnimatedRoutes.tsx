
import { useRef, memo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import AppRoutes from "@/routes/AppRoutes";

// Email cleanup timeout reference
let cleanupTimeoutRef: number | null = null;

// Memoize the AnimatedRoutes component to prevent unnecessary re-renders
const AnimatedRoutes = memo(() => {
  const location = useLocation();
  const nodeRef = useRef(null);
  const emailCleanupAttempts = useRef(0);
  const maxCleanupAttempts = 3;
  const cleanupDone = useRef(false);
  
  // Effect to clear any lingering DOM elements that might cause issues
  useEffect(() => {
    // Reset cleanup state on new route
    emailCleanupAttempts.current = 0;
    cleanupDone.current = false;
    
    // Clear previous timeout if it exists
    if (cleanupTimeoutRef !== null) {
      clearTimeout(cleanupTimeoutRef);
      cleanupTimeoutRef = null;
    }
    
    // Clean up any orphaned DOM elements that could be showing static emails
    const cleanup = () => {
      if (cleanupDone.current || emailCleanupAttempts.current >= maxCleanupAttempts) {
        return;
      }
      
      emailCleanupAttempts.current += 1;
      
      try {
        // Find ALL potential orphaned elements that could be showing static content
        const orphanedElements = document.querySelectorAll('body > *:not(.app-container):not(#root):not(script):not(style):not(.sonner-toast-container)');
        orphanedElements.forEach(element => {
          console.log("Checking element for removal:", element.tagName);
          try {
            element.remove();
          } catch (e) {
            console.error("Failed to remove element:", e);
          }
        });
        
        // Look for email text nodes directly in the document body 
        // and remove them if they're not within our app container
        const removeOrphanedEmails = () => {
          // This regex matches common email patterns
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
          
          let emailsRemoved = 0;
          
          try {
            // Find all text nodes in the document
            const findTextNodes = (element: Node) => {
              if (!element) return;
              
              try {
                if (element.nodeType === Node.TEXT_NODE) {
                  const content = element.textContent;
                  
                  // If this text node contains what looks like an email
                  if (content && emailRegex.test(content)) {
                    // Check if it's not within our app container
                    let parent = element.parentElement;
                    let isInsideApp = false;
                    
                    if (!parent) return;
                    
                    while (parent && parent !== document.body) {
                      if (parent.classList?.contains('app-container') || 
                          parent.id === 'root' || 
                          parent.classList?.contains('sonner-toast-container') ||
                          parent.classList?.contains('page-transition')) {
                        isInsideApp = true;
                        break;
                      }
                      parent = parent.parentElement;
                      if (!parent) break;
                    }
                    
                    if (!isInsideApp && element.textContent) {
                      console.log("Removing orphaned email text:", content.trim());
                      try {
                        element.textContent = "";
                        emailsRemoved++;
                      } catch (e) {
                        console.error("Failed to clear text content:", e);
                      }
                    }
                  }
                } else {
                  // Process all child nodes
                  try {
                    for (let i = 0; element.childNodes && i < element.childNodes.length; i++) {
                      findTextNodes(element.childNodes[i]);
                    }
                  } catch (e) {
                    console.error("Error processing child nodes:", e);
                  }
                }
              } catch (e) {
                console.error("Error in findTextNodes:", e);
              }
            };
            
            // Start from the body
            findTextNodes(document.body);
            
            // Also look for any elements that might contain emails but aren't managed by React
            try {
              document.querySelectorAll('body > *:not(#root):not(script):not(style):not(.sonner-toast-container)').forEach(el => {
                if (el.textContent && emailRegex.test(el.textContent)) {
                  console.log("Removing orphaned element with email:", el.textContent);
                  try {
                    el.remove();
                    emailsRemoved++;
                  } catch (e) {
                    console.error("Failed to remove element with email:", e);
                  }
                }
              });
            } catch (e) {
              console.error("Error removing orphaned elements:", e);
            }
          } catch (e) {
            console.error("Error in removeOrphanedEmails:", e);
          }
          
          if (emailsRemoved > 0) {
            console.log(`Removed ${emailsRemoved} orphaned email instances`);
          } else if (emailCleanupAttempts.current >= maxCleanupAttempts) {
            console.log("Email cleanup complete - max attempts reached");
            cleanupDone.current = true;
          }
          
          return emailsRemoved;
        };
        
        const emailsRemoved = removeOrphanedEmails();
        
        // If we removed emails, try again after a delay
        if (emailsRemoved > 0 && emailCleanupAttempts.current < maxCleanupAttempts) {
          cleanupTimeoutRef = window.setTimeout(cleanup, 500);
        } else {
          cleanupDone.current = true;
        }
      } catch (e) {
        console.error("Error in cleanup process:", e);
        cleanupDone.current = true;
      }
    };
    
    // Run cleanup after a small delay to ensure DOM is settled
    cleanupTimeoutRef = window.setTimeout(cleanup, 100);
    
    // Clean up before unmounting
    return () => {
      if (cleanupTimeoutRef !== null) {
        clearTimeout(cleanupTimeoutRef);
        cleanupTimeoutRef = null;
      }
    };
  }, [location.pathname]);
  
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.key}
        timeout={150} // Keep timing consistent at 150ms for smooth transitions
        classNames="route-transition"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="page-transition">
          <AppRoutes />
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
});

AnimatedRoutes.displayName = 'AnimatedRoutes';

export default AnimatedRoutes;
