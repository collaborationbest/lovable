
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { FileX, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/access-control/useAccessControl";

interface RecouvrementListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RecouvrementListDialog = ({ open, onOpenChange }: RecouvrementListDialogProps) => {
  const [recouvrements, setRecouvrements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAccessControl();
  
  useEffect(() => {
    const fetchRecouvrements = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have a valid session
        if (!userId) {
          console.log("No user ID found");
          return;
        }
        
        const { data, error } = await supabase
          .from('recouvrement_demandes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setRecouvrements(data || []);
      } catch (error) {
        console.error("Error fetching recouvrements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (open) {
      fetchRecouvrements();
    }
  }, [open, userId]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Demandes de recouvrement en cours</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 pr-2">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : recouvrements.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Aucune demande de recouvrement en cours</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recouvrements.map((recouvrement) => (
                <div key={recouvrement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        {recouvrement.patient_first_name} {recouvrement.patient_last_name || ""}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {recouvrement.patient_email || "Email non renseigné"}
                      </p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      En cours
                    </div>
                  </div>
                  
                  <div className="text-sm mt-3">
                    <p><span className="font-medium">Montant:</span> {recouvrement.amount_due ? `${recouvrement.amount_due}€` : "Non renseigné"}</p>
                    <p><span className="font-medium">Description:</span> {recouvrement.description || "Non renseignée"}</p>
                    <p><span className="font-medium">Créée le:</span> {new Date(recouvrement.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecouvrementListDialog;
