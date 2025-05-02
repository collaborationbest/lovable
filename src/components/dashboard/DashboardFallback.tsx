
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const DashboardFallback = () => {
  const handleRefresh = () => {
    // Show a loading toast
    toast.loading("Actualisation de l'application...");
    
    // Add a small delay before refreshing to give feedback to the user
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <div className="flex-1 w-full h-screen content-area custom-scrollbar p-8">
        <div className="max-w-4xl mx-auto text-center mt-16">
          <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
          <p className="text-gray-600 mb-8">
            Nous avons rencontré un problème lors du chargement de votre tableau de bord. 
            Veuillez actualiser la page ou revenir plus tard.
          </p>
          <Button 
            onClick={handleRefresh}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser la page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFallback;
