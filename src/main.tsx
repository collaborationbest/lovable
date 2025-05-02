
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'; 
import App from './App.tsx'
import './index.css'

// Initialize and optimize performance
const initApp = () => {
  // Add transition styles
  const style = document.createElement('style');
  style.textContent = `
    /* Base transition styles */
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      position: relative;
    }
    
    /* Prevent layout shifts during transitions */
    .content-container {
      flex: 1;
      position: relative;
      width: 100%;
    }
    
    /* Optimize rendering performance */
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }
    
    /* Prevent scrollbar jumps during page transitions */
    html {
      overflow-y: scroll;
      scroll-behavior: smooth;
    }
    
    /* Disable loader overlay for internal navigation */
    .no-transition {
      transition: none !important;
    }
  `;
  document.head.appendChild(style);

  // Initialize navigation tracking
  if (typeof window !== 'undefined') {
    // Set initial navigation time
    sessionStorage.setItem('lastNavigationTime', Date.now().toString());
    
    // Listen for navigation events
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // Check if click is on a navigation link
      const navLink = target.closest('a[href]');
      if (navLink) {
        sessionStorage.setItem('lastNavigationTime', Date.now().toString());
      }
    });
  }

  // Pre-resolve common imports
  // This ensures key modules are loaded early
  import('./App.tsx');
  import('./routes/AppRoutes.tsx');

  // Optimize initial rendering
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
};

// Execute initialization
initApp();
