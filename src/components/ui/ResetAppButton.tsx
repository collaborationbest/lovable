
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { deleteAllUsers } from "@/utils/adminUtils";
import { toast } from "sonner";

/**
 * Bouton permettant de réinitialiser l'application en supprimant tous les utilisateurs
 * Réservé au propriétaire du compte
 */
export const ResetAppButton = () => {
  const [isResetting, setIsResetting] = useState(false);
  
  const handleReset = async () => {
    try {
      setIsResetting(true);
      await deleteAllUsers();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast.error("Une erreur est survenue lors de la réinitialisation");
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <Button
      variant="destructive"
      size="sm"
      className="gap-2"
      onClick={handleReset}
      disabled={isResetting}
    >
      <AlertTriangle size={16} />
      {isResetting ? "Réinitialisation en cours..." : "Réinitialiser l'application"}
    </Button>
  );
};
