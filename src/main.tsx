
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'; // Added StrictMode
import App from './App.tsx'
import './index.css'

// Optimize initial rendering
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
