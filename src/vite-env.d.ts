
/// <reference types="vite/client" />

// Add Sentry type definition to Window interface
interface Window {
  Sentry?: {
    captureException: (error: Error) => void;
  };
}
