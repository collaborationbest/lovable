
import { toast as sonnerToast } from "sonner";
import { useToast as useToastOriginal } from "@/hooks/use-toast";

// Create a compatible toast interface that works with both APIs
export const toast = {
  // Basic toast methods that work with both APIs
  ...sonnerToast,
  
  // Shadcn-style methods
  error: (content: string, options?: any) => {
    return sonnerToast.error(content, options);
  },
  success: (content: string, options?: any) => {
    return sonnerToast.success(content, options);
  },
  
  // For shadcn-style object syntax
  // This allows using {title, description, variant} format
  // but converts it to the sonner format
  default: ({ title, description, variant }: { title?: string, description?: string, variant?: string }) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title || '', { description });
    }
    return sonnerToast(title || '', { description });
  }
};

// Add call signature to make TypeScript happy
(toast as any).__call = function(props: any) {
  return this.default(props);
};

// Make the toast object callable
const handler = {
  apply: function(target: any, _: any, args: any[]) {
    if (typeof args[0] === 'string') {
      return sonnerToast(args[0], args[1]);
    }
    return target.default(args[0]);
  }
};

// Create and export the callable toast function
export const callableToast = new Proxy(toast, handler) as typeof toast & ((props: { title?: string, description?: string, variant?: string }) => void);

// Re-export shadcn's useToast for compatibility
export const useToast = () => {
  const originalHook = useToastOriginal();
  
  return {
    ...originalHook,
    toast: callableToast
  };
};
