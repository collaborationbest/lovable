
import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import lazy des pages pour réduire le bundle initial
const Index = lazy(() => import("@/pages/Index"));
const Planning = lazy(() => import("@/pages/Planning"));
const Equipe = lazy(() => import("@/pages/Equipe"));
const Documents = lazy(() => import("@/pages/Documents"));
const Operations = lazy(() => import("@/pages/Operations"));
const Patients = lazy(() => import("@/pages/Patients"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Parametres = lazy(() => import("@/pages/Parametres"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const MagicLink = lazy(() => import("@/pages/MagicLink"));
const BoitesAOutils = lazy(() => import("@/pages/BoitesAOutils"));
const CentreAide = lazy(() => import("@/pages/CentreAide"));

// Outils IA - chargés paresseusement
const OutilsIAIndex = lazy(() => import("@/pages/outils-ia/index"));
const Local = lazy(() => import("@/pages/outils-ia/Local"));
const BusinessPlan = lazy(() => import("@/pages/outils-ia/BusinessPlan"));
const Travaux = lazy(() => import("@/pages/outils-ia/Travaux"));
const Equipement = lazy(() => import("@/pages/outils-ia/Equipement"));
const Administratif = lazy(() => import("@/pages/outils-ia/Administratif"));
const Financement = lazy(() => import("@/pages/outils-ia/Financement"));
const Rentabilite = lazy(() => import("@/pages/outils-ia/Rentabilite"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/magic-link" element={<MagicLink />} />
      
      {/* Redirect root to auth if not authenticated */}
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      {/* Routes protégées qui nécessitent une authentification */}
      <Route 
        path="/planning" 
        element={
          <ProtectedRoute>
            <Planning />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/equipe" 
        element={
          <ProtectedRoute>
            <Equipe />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patients" 
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/operations" 
        element={
          <ProtectedRoute>
            <Operations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/documents" 
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/boites-a-outils" 
        element={
          <ProtectedRoute>
            <BoitesAOutils />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/centre-aide" 
        element={
          <ProtectedRoute>
            <CentreAide />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia" 
        element={
          <ProtectedRoute>
            <OutilsIAIndex />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia/local" 
        element={
          <ProtectedRoute>
            <Local />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia/business-plan" 
        element={
          <ProtectedRoute>
            <BusinessPlan />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia/travaux" 
        element={
          <ProtectedRoute>
            <Travaux />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia/equipement" 
        element={
          <ProtectedRoute>
            <Equipement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia/administratif" 
        element={
          <ProtectedRoute>
            <Administratif />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia/financement" 
        element={
          <ProtectedRoute>
            <Financement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/outils-ia/rentabilite" 
        element={
          <ProtectedRoute>
            <Rentabilite />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/parametres" 
        element={
          <ProtectedRoute>
            <Parametres />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
