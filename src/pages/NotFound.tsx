
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.warn(
      "Page non trouvée : L'utilisateur a tenté d'accéder à une route inexistante :",
      location.pathname
    );
  }, [location.pathname]);

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f2ee]">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-4">
          <AlertTriangle size={64} className="text-amber-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-[#5C4E3D]">404</h1>
        <p className="text-xl text-[#5C4E3D]/80 mb-6">Oups ! Page non trouvée</p>
        <p className="text-[#5C4E3D]/70 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée. Si vous cherchiez des dossiers ou documents, il se peut qu'il y ait eu un problème de chargement. Veuillez retourner à l'accueil et réessayer.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="flex items-center gap-2 bg-[#B88E23] hover:bg-[#8A6A1B]"
            onClick={goHome}
          >
            <Home size={18} />
            Accueil
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-[#B88E23] text-[#B88E23] hover:bg-[#B88E23]/10"
            onClick={goBack}
          >
            <ArrowLeft size={18} />
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
