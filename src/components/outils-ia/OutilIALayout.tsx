import React, { ReactNode, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/scroll-area";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { safeImport } from "@/utils/importUtils";

interface OutilIALayoutProps {
  title: string;
  icon: ReactNode;
  description?: string;
  children: ReactNode;
}

const OutilIALayout = ({
  title,
  icon,
  children
}: OutilIALayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Preload adjacent pages when this layout is mounted
  useEffect(() => {
    // Determine the current tool to preload related ones
    const currentPath = location.pathname;
    const toolsToPreload = [];
    
    // Always preload the main page
    if (currentPath !== "/outils-ia") {
      safeImport(() => import("@/pages/outils-ia/index"));
    }
    
    // Preload related tools based on current path
    if (currentPath === "/outils-ia") {
      // If on main page, preload most common tools
      toolsToPreload.push(
        safeImport(() => import("@/pages/outils-ia/Local")),
        safeImport(() => import("@/pages/outils-ia/SuiviDevis")),
        safeImport(() => import("@/pages/outils-ia/QuestionnaireMedical"))
      );
    } else if (currentPath.includes("questionnaire-medical")) {
      // Preload related questionnaire pages
      toolsToPreload.push(
        safeImport(() => import("@/pages/QuestionnaireResponses")),
        safeImport(() => import("@/pages/QuestionnairePublic"))
      );
    } else if (currentPath.includes("suivi-devis")) {
      // Preload quote-related components
      toolsToPreload.push(
        safeImport(() => import("@/components/outils-ia/suivi-devis/QuoteDialogs")),
        safeImport(() => import("@/components/outils-ia/suivi-devis/QuoteTable"))
      );
    }
    
    // Execute preloading without awaiting
    Promise.all(toolsToPreload).catch(err => {
      console.error("Error preloading pages:", err);
    });
  }, [location.pathname]);
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white overflow-hidden">
      {/* Sidebar for desktop only */}
      <Sidebar />
      
      <div className="flex-1 h-screen flex flex-col items-center overflow-hidden">
        {/* Mobile menu button - only shown when needed */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 left-4 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[85%] max-w-sm">
              <ScrollArea className="h-full">
                <div className="p-2">
                  <Sidebar mobileView={true} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
        
        <ScrollArea className="w-full h-full">
          <div className="w-full py-6 mobile-content-area px-4 md:px-6 lg:px-8">
            <div className="w-full max-w-full mx-auto">
              {/* Page Header - Using consistent header component with padding */}
              <div className="pt-6 md:pt-8">
                <PageHeader 
                  title={title}
                  icon={icon}
                />
              </div>

              {/* Content */}
              <div className="w-full bg-white rounded-lg border border-[#B88E23]/10 p-4 shadow-sm mt-6 mx-0">
                {children}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default OutilIALayout;
