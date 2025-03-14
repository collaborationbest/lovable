
import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";

export interface Laboratory {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface LaboratorySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LaboratorySettingsDialog = ({ open, onOpenChange }: LaboratorySettingsDialogProps) => {
  const [laboratories, setLaboratories] = useLocalStorage<Laboratory[]>("prostheticsLaboratories", []);
  const [newLaboratory, setNewLaboratory] = useState<Omit<Laboratory, "id">>({
    name: "",
    phone: "",
    email: "",
  });
  
  const { toast } = useToast();

  const handleAddLaboratory = () => {
    if (!newLaboratory.name) {
      toast({
        title: "Nom requis",
        description: "Le nom du laboratoire est obligatoire",
        variant: "destructive"
      });
      return;
    }
    
    const laboratory: Laboratory = {
      ...newLaboratory,
      id: Date.now().toString()
    };
    
    setLaboratories([...laboratories, laboratory]);
    setNewLaboratory({
      name: "",
      phone: "",
      email: "",
    });
    
    toast({
      title: "Laboratoire ajouté",
      description: `Le laboratoire ${laboratory.name} a été ajouté.`
    });
  };

  const handleDeleteLaboratory = (id: string) => {
    setLaboratories(laboratories.filter(lab => lab.id !== id));
    toast({
      title: "Laboratoire supprimé",
      description: "Le laboratoire a été supprimé avec succès."
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
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              value={newLaboratory.phone}
              onChange={(e) => setNewLaboratory({ ...newLaboratory, phone: e.target.value })}
              placeholder="Entrez le numéro de téléphone"
            />
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
          {laboratories.length === 0 ? (
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
                      {lab.phone && <p className="text-sm">Tél: {lab.phone}</p>}
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
