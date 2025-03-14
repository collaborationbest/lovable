
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Check if this is a database-related error
    const errorString = error.toString();
    const isDbError = 
      errorString.includes('infinite recursion') || 
      errorString.includes('policy for relation') ||
      errorString.includes('42P17') ||
      errorString.includes('violates row-level security') ||
      errorString.includes('permission denied') ||
      errorString.includes('Impossible de charger les dossiers') ||
      errorString.includes('Impossible de récupérer la liste des professionnels');
    
    // Customize the message based on the error type
    const message = isDbError
      ? "Une erreur de base de données est survenue. Nous avons corrigé le problème, veuillez rafraîchir la page."
      : "Une erreur s'est produite. Essayez de rafraîchir la page.";
    
    // Notify user with toast
    toast.error(message, {
      duration: 8000,
      id: "error-boundary"
    });
    
    // Update state to include errorInfo
    this.setState({ errorInfo });
  }

  public reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Check if this is a database-related error
      const errorString = this.state.error?.toString() || "";
      const isDbError = 
        errorString.includes('infinite recursion') || 
        errorString.includes('policy for relation') ||
        errorString.includes('42P17') ||
        errorString.includes('violates row-level security') ||
        errorString.includes('permission denied') ||
        errorString.includes('Impossible de charger les dossiers') ||
        errorString.includes('Impossible de récupérer la liste des professionnels');

      return (
        <div className="flex items-center justify-center min-h-[50vh] p-6">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <div className="flex justify-center mb-4">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#5C4E3D]">Une erreur est survenue</h2>
            <p className="text-[#5C4E3D]/70 mb-6">
              {isDbError 
                ? "Nous sommes désolés, une erreur de base de données s'est produite. Nous avons corrigé le problème, veuillez rafraîchir la page pour continuer."
                : "Nous sommes désolés, une erreur inattendue s'est produite. Veuillez rafraîchir la page ou contacter le support si le problème persiste."}
            </p>
            {this.state.error && (
              <div className="bg-red-50 p-3 rounded mb-6 text-left">
                <p className="text-red-800 text-sm font-mono overflow-auto max-h-32">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <Button 
              className="flex items-center gap-2 bg-[#B88E23] hover:bg-[#8A6A1B]"
              onClick={() => {
                this.reset();
                window.location.reload();
              }}
            >
              <RefreshCw size={18} />
              Rafraîchir la page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
