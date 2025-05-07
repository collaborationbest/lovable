
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { menuItems, aiTools } from "./navigationConfig";
import { safeImport } from "@/utils/importUtils";

// Map of routes to their corresponding lazy-loaded components
const routeComponentMap: Record<string, () => Promise<any>> = {
  "/": () => import("@/pages/Index"),
  "/planning": () => import("@/pages/Planning"),
  "/equipe": () => import("@/pages/Equipe"),
  "/documents": () => import("@/pages/Documents"),
  "/operations": () => import("@/pages/Operations"),
  "/patients": () => import("@/pages/Patients"),
  "/centre-aide": () => import("@/pages/CentreAide"),
  "/gestion-droits": () => import("@/pages/GestionDroits"),
  "/parametres": () => import("@/pages/Parametres"),
  "/auth": () => import("@/pages/Auth"),
  "/reset-password": () => import("@/pages/ResetPassword"),
  "/magic-link": () => import("@/pages/MagicLink"),
  "/outils-ia": () => import("@/pages/outils-ia/index"),
  "/outils-ia/local": () => import("@/pages/outils-ia/Local"),
  "/outils-ia/business-plan": () => import("@/pages/outils-ia/BusinessPlan"),
  "/outils-ia/travaux": () => import("@/pages/outils-ia/Travaux"),
  "/outils-ia/equipement": () => import("@/pages/outils-ia/Equipement"),
  "/outils-ia/administratif": () => import("@/pages/outils-ia/Administratif"),
  "/outils-ia/financement": () => import("@/pages/outils-ia/Financement"),
  "/outils-ia/rentabilite": () => import("@/pages/outils-ia/Rentabilite"),
  "/outils-ia/questionnaire-medical": () => import("@/pages/outils-ia/QuestionnaireMedical"),
  "/outils-ia/compte-rendu-ia": () => import("@/pages/outils-ia/CompteRenduIA"),
  "/outils-ia/tracabilite-implantaire": () => import("@/pages/outils-ia/TracabiliteImplantaire"),
  "/outils-ia/suivi-devis": () => import("@/pages/outils-ia/SuiviDevis"),
  "/outils-ia/stock": () => import("@/pages/outils-ia/Stock"),
  "/outils-ia/recouvrement": () => import("@/pages/outils-ia/Recouvrement"),
  "/outils-ia/recrutement": () => import("@/pages/outils-ia/Recrutement"),
  "/outils-ia/secretariat": () => import("@/pages/outils-ia/Secretariat"),
  "/outils-ia/paiement-echelonne": () => import("@/pages/outils-ia/PaiementEchelonne"),
  "/questionnaire-public": () => import("@/pages/QuestionnairePublic"),
  "/questionnaire-public/:id": () => import("@/pages/QuestionnairePublic"),
  "/outils-ia/questionnaire-responses": () => import("@/pages/QuestionnaireResponses"),
  "/outils-ia/questionnaire-responses/:id": () => import("@/pages/QuestionnaireResponses"),
  "/*": () => import("@/pages/NotFound"), // Wildcard route for 404 page
};

// Custom preload function for SuiviDevis to ensure all its component dependencies are loaded
const preloadSuiviDevis = async () => {
  try {
    console.log("Preloading SuiviDevis and related components...");
    // Load main page
    const SuiviDevisModule = safeImport(() => import("@/pages/outils-ia/SuiviDevis"));
    
    // Load components in parallel
    const componentsPromises = [
      safeImport(() => import("@/components/outils-ia/suivi-devis/QuoteDialogs")),
      safeImport(() => import("@/components/outils-ia/suivi-devis/QuoteFilters")),
      safeImport(() => import("@/components/outils-ia/suivi-devis/QuoteTable")),
      safeImport(() => import("@/hooks/useQuotes"))
    ];
    
    // Wait for all to resolve
    await Promise.all([SuiviDevisModule, ...componentsPromises]);
    console.log("SuiviDevis preload complete");
  } catch (err) {
    console.error("Failed to preload SuiviDevis:", err);
  }
};

// Preload a specific route
const preloadRoute = (route: string) => {
  // Special handling for SuiviDevis which had loading issues
  if (route === "/outils-ia/suivi-devis") {
    preloadSuiviDevis().catch(err => {
      console.error(`Failed specialized preload for ${route}:`, err);
    });
    return;
  }

  const loader = routeComponentMap[route];
  if (loader) {
    // Start loading the component, but use our safe import utility
    safeImport(loader).catch(err => {
      console.error(`Failed to preload route ${route}:`, err);
    });
  }
};

// Preload all pages in the application
const preloadAllPages = () => {
  console.log("Preloading all application pages");
  
  // First batch: Main navigation items
  menuItems.forEach((item, index) => {
    setTimeout(() => {
      preloadRoute(item.href);
    }, index * 100); // Increased delay between preloads to reduce network contention
  });
  
  // Second batch: Authentication related pages
  setTimeout(() => {
    preloadRoute("/auth");
    preloadRoute("/reset-password");
    preloadRoute("/magic-link");
  }, menuItems.length * 100 + 100);
  
  // Third batch: All AI tools
  setTimeout(() => {
    preloadRoute("/outils-ia");
    
    aiTools.forEach((tool, index) => {
      setTimeout(() => {
        preloadRoute(tool.href);
      }, index * 100);
    });
  }, menuItems.length * 100 + 300);
  
  // Fourth batch: Special pages
  setTimeout(() => {
    preloadRoute("/questionnaire-public");
    preloadRoute("/outils-ia/questionnaire-responses");
    preloadRoute("/*"); // 404 page
  }, menuItems.length * 100 + aiTools.length * 100 + 500);
};

const RoutePreloader = () => {
  const location = useLocation();
  
  // On first load, preload all application pages
  useEffect(() => {
    // Only preload if not already done and if not in development mode
    const shouldPreload = !sessionStorage.getItem("routesPreloaded") && 
      process.env.NODE_ENV !== 'development';
    
    if (shouldPreload) {
      // Use a small delay to allow the initial render to complete
      setTimeout(() => {
        preloadAllPages();
        sessionStorage.setItem("routesPreloaded", "true");
      }, 1000);
    }
  }, []);
  
  // Preload current route's related routes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // If in outils-ia section, preload related outils-ia pages
    if (currentPath.includes("/outils-ia")) {
      // If on main outils-ia page, preload most common subsections
      if (currentPath === "/outils-ia") {
        setTimeout(() => {
          preloadRoute("/outils-ia/local");
          preloadRoute("/outils-ia/business-plan");
          preloadRoute("/outils-ia/recouvrement");
          preloadRoute("/outils-ia/suivi-devis");
          preloadRoute("/outils-ia/paiement-echelonne");
        }, 200);
        
        setTimeout(() => {
          preloadRoute("/outils-ia/travaux");
          preloadRoute("/outils-ia/administratif");
        }, 400);
        
        setTimeout(() => {
          preloadRoute("/outils-ia/questionnaire-medical");
        }, 600);
      }
      
      // If on recouvrement page, ensure related documents are preloaded
      if (currentPath === "/outils-ia/recouvrement") {
        setTimeout(() => {
          preloadRoute("/outils-ia");
        }, 200);
      }
      
      // If on suivi-devis page, preload related pages
      if (currentPath === "/outils-ia/suivi-devis") {
        setTimeout(() => {
          preloadRoute("/outils-ia");
        }, 200);
      }
      
      // If on payment échelonné page, preload related pages
      if (currentPath === "/outils-ia/paiement-echelonne") {
        setTimeout(() => {
          preloadRoute("/outils-ia");
        }, 200);
      }
      
      // If on questionnaire medical page, preload responses pages
      if (currentPath === "/outils-ia/questionnaire-medical") {
        setTimeout(() => {
          preloadRoute("/outils-ia/questionnaire-responses");
          preloadRoute("/questionnaire-public");
          preloadRoute("/questionnaire-public/:id");
        }, 200);
      }
      
      // If on questionnaire responses page, ensure we preload the public questionnaire
      if (currentPath.includes("/outils-ia/questionnaire-responses")) {
        setTimeout(() => {
          preloadRoute("/questionnaire-public");
          preloadRoute("/questionnaire-public/:id");
        }, 200);
      }
    }
    
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
};

export default RoutePreloader;
