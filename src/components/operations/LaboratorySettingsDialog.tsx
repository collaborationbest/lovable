
import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Laboratory {
  id: string;
  name: string;
  phone: string;
  phone_numbers?: string[];
  email: string;
}

interface LaboratorySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LaboratorySettingsDialog = ({ open, onOpenChange }: LaboratorySettingsDialogProps) => {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [newLaboratory, setNewLaboratory] = useState<Omit<Laboratory, "id">>({
    name: "",
    phone: "",
    phone_numbers: [""],
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch laboratories from Supabase
  const fetchLaboratories = async () => {
    try {
      console.log("Fetching laboratories...");
      setIsLoading(true);
      const { data, error } = await supabase
        .from('laboratories')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      console.log("Laboratories fetched:", data);
      setLaboratories(data as Laboratory[]);
    } catch (error: any) {
      console.error("Error fetching laboratories:", error);
      toast.error("Erreur lors du chargement des laboratoires");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLaboratories();
    }
  }, [open]);

  const handleAddLaboratory = async () => {
    if (!newLaboratory.name) {
      toast.error("Le nom du laboratoire est obligatoire");
      return;
    }
    
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        toast.error("Vous devez être connecté pour ajouter un laboratoire");
        return;
      }
      
      // Get the user's cabinet_id
      const { data: teamMemberData } = await supabase
        .from('team_members')
        .select('cabinet_id')
        .eq('user_id', userId)
        .single();
      
      const cabinetId = teamMemberData?.cabinet_id;
      
      // Filter out empty phone numbers
      const filteredPhoneNumbers = newLaboratory.phone_numbers?.filter(phone => phone.trim() !== '') || [];
      
      const { data, error } = await supabase
        .from('laboratories')
        .insert({
          name: newLaboratory.name,
          phone: filteredPhoneNumbers[0] || "", // Keep first number in the phone field for backwards compatibility
          phone_numbers: filteredPhoneNumbers,
          email: newLaboratory.email,
          user_id: userId,
          cabinet_id: cabinetId
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log("Laboratory added:", data);
      
      // Refresh laboratories list
      fetchLaboratories();
      
      // Reset form
      setNewLaboratory({
        name: "",
        phone: "",
        phone_numbers: [""],
        email: "",
      });
      
      toast.success(`Le laboratoire ${newLaboratory.name} a été ajouté.`);
    } catch (error: any) {
      console.error("Error adding laboratory:", error);
      toast.error("Erreur lors de l'ajout du laboratoire");
    }
  };

  const handleDeleteLaboratory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('laboratories')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh the list after deletion
      fetchLaboratories();
      
      toast.success("Le laboratoire a été supprimé avec succès.");
    } catch (error: any) {
      console.error("Error deleting laboratory:", error);
      toast.error("Erreur lors de la suppression du laboratoire");
    }
  };

  const handleAddPhoneField = () => {
    setNewLaboratory(prev => ({
      ...prev,
      phone_numbers: [...(prev.phone_numbers || []), ""]
    }));
  };

  const handleRemovePhoneField = (index: number) => {
    setNewLaboratory(prev => {
      const updatedPhones = [...(prev.phone_numbers || [])];
      updatedPhones.splice(index, 1);
      return {
        ...prev,
        phone_numbers: updatedPhones.length ? updatedPhones : [""]
      };
    });
  };

  const handlePhoneChange = (index: number, value: string) => {
    setNewLaboratory(prev => {
      const updatedPhones = [...(prev.phone_numbers || [])];
      updatedPhones[index] = value;
      return {
        ...prev,
        phone_numbers: updatedPhones,
        phone: index === 0 ? value : prev.phone // Keep first number in phone field too
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des laboratoires</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du laboratoire</Label>
            <Input
              id="name"
              value={newLaboratory.name}
              onChange={(e) => setNewLaboratory({ ...newLaboratory, name: e.target.value })}
              placeholder="Entrez le nom du laboratoire"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Numéros de téléphone</Label>
            {newLaboratory.phone_numbers?.map((phone, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  placeholder="Entrez un numéro de téléphone"
                />
                {newLaboratory.phone_numbers!.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handleRemovePhoneField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddPhoneField}
              className="mt-1"
              type="button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un numéro
            </Button>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newLaboratory.email}
              onChange={(e) => setNewLaboratory({ ...newLaboratory, email: e.target.value })}
              placeholder="Entrez l'adresse email"
            />
          </div>
          
          <Button onClick={handleAddLaboratory} className="mt-2">
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-3">Laboratoires enregistrés</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement des laboratoires...</p>
          ) : laboratories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun laboratoire enregistré.</p>
          ) : (
            <div className="grid gap-3">
              {laboratories.map((lab) => (
                <Card key={lab.id} className="bg-gray-50">
                  <CardContent className="p-3 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() => handleDeleteLaboratory(lab.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <div className="grid gap-1">
                      <h4 className="font-medium">{lab.name}</h4>
                      {/* Display all phone numbers if available, otherwise fallback to single phone */}
                      {lab.phone_numbers && lab.phone_numbers.length > 0 ? (
                        <div className="text-sm">
                          <p className="font-medium text-xs text-muted-foreground mb-1">Téléphones:</p>
                          {lab.phone_numbers.map((phone, index) => (
                            <p key={index} className="text-sm">{phone}</p>
                          ))}
                        </div>
                      ) : lab.phone && (
                        <p className="text-sm">Tél: {lab.phone}</p>
                      )}
                      {lab.email && <p className="text-sm">Email: {lab.email}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaboratorySettingsDialog;
