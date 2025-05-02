
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    // Ensure assets have consistent naming and are properly hashed
    assetsDir: 'assets',
    // Improve asset loading with better cache policies
    assetsInlineLimit: 4096,
    // Ensure consistent chunk naming
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-label', 
               '@radix-ui/react-slot', '@radix-ui/react-accordion', '@radix-ui/react-checkbox'],
          utils: ['date-fns', 'uuid', 'clsx', 'tailwind-merge'],
          supabase: ['@supabase/supabase-js', '@supabase/auth-ui-react'],
          capacitor: ['@capacitor/core']
        }
      }
    }
  },
  // Make .env variables available
  envPrefix: ['VITE_', 'SUPABASE_', 'RESEND_', 'OPENAI_', 'GOOGLE_MAPS_']
}));
