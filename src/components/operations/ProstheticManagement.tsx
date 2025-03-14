
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Search, X } from "lucide-react";
import LaboratorySettingsDialog, { Laboratory } from "./LaboratorySettingsDialog";
import useLocalStorage from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Prosthetic {
  id: string;
  patientFirstName: string;
  patientLastName: string;
  laboratory: string;
  arrivalDate: string;
  prostheticType: string;
  status: "pending" | "arrived" | "delivered";
}

interface Patient {
  id: string;
  nom: string;
  prenom: string;
}

interface ProstheticManagementProps {
  searchQuery?: string;
}

const ProstheticManagement = () => {
  const [prosthetics, setProsthetics] = useState<Prosthetic[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLabSettingsOpen, setIsLabSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [laboratories] = useLocalStorage<Laboratory[]>("prostheticsLaboratories", []);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [newProsthetic, setNewProsthetic] = useState<Omit<Prosthetic, "id">>({
    patientFirstName: "",
    patientLastName: "",
    laboratory: "",
    arrivalDate: new Date().toISOString().split("T")[0],
    prostheticType: "",
    status: "pending"
  });
  
  const { toast } = useToast();

  useEffect(() => {
    // Fetch patients from Supabase
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, nom, prenom')
        .order('nom');
      
      if (error) {
        console.error("Error fetching patients:", error);
        return;
      }
      
      if (data) {
        setPatients(data);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (patientSearchTerm.length > 1) {
      const searchTermLower = patientSearchTerm.toLowerCase();
      const filtered = patients.filter(patient => 
        patient.nom.toLowerCase().includes(searchTermLower) || 
        patient.prenom.toLowerCase().includes(searchTermLower)
      );
      setFilteredPatients(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setFilteredPatients([]);
    }
  }, [patientSearchTerm, patients]);

  const handleAddProsthetic = () => {
    if (!newProsthetic.patientLastName || !newProsthetic.laboratory || !newProsthetic.prostheticType) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    const prosthetic: Prosthetic = {
      ...newProsthetic,
      id: Date.now().toString()
    };
    
    setProsthetics([...prosthetics, prosthetic]);
    setNewProsthetic({
      patientFirstName: "",
      patientLastName: "",
      laboratory: "",
      arrivalDate: new Date().toISOString().split("T")[0],
      prostheticType: "",
      status: "pending"
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Prothèse ajoutée",
      description: `La prothèse pour ${prosthetic.patientFirstName} ${prosthetic.patientLastName} a été ajoutée.`
    });
  };

  const selectPatient = (patient: Patient) => {
    setNewProsthetic({
      ...newProsthetic,
      patientFirstName: patient.prenom,
      patientLastName: patient.nom
    });
    setPatientSearchTerm(`${patient.prenom} ${patient.nom}`);
    setIsSearching(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "arrived": return "Arrivée";
      case "delivered": return "Livrée";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "arrived": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLaboratoryName = (labId: string) => {
    const laboratory = laboratories.find(lab => lab.id === labId);
    return laboratory ? laboratory.name : labId;
  };

  const filteredProsthetics = prosthetics.filter(prosthetic => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const labName = getLaboratoryName(prosthetic.laboratory).toLowerCase();
    const patientName = `${prosthetic.patientFirstName} ${prosthetic.patientLastName}`.toLowerCase();
    
    return (
      patientName.includes(searchLower) ||
      labName.includes(searchLower) ||
      prosthetic.prostheticType.toLowerCase().includes(searchLower) ||
      getStatusLabel(prosthetic.status).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestion des prothèses</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsLabSettingsOpen(true)} title="Paramètres des laboratoires">
            <Settings className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter une prothèse</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle prothèse</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="patientSearch">Patient</Label>
                  <div className="relative">
                    <Popover open={isSearching && filteredPatients.length > 0} onOpenChange={setIsSearching}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            id="patientSearch"
                            placeholder="Rechercher un patient..."
                            value={patientSearchTerm}
                            onChange={(e) => {
                              setPatientSearchTerm(e.target.value);
                              if (e.target.value.length > 1) {
                                setIsSearching(true);
                              } else {
                                setIsSearching(false);
                              }
                            }}
                            className="w-full"
                            ref={searchInputRef}
                          />
                          {patientSearchTerm && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full"
                              onClick={() => {
                                setPatientSearchTerm("");
                                setNewProsthetic({
                                  ...newProsthetic,
                                  patientFirstName: "",
                                  patientLastName: ""
                                });
                                if (searchInputRef.current) {
                                  searchInputRef.current.focus();
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[300px]" align="start">
                        <div className="overflow-y-auto max-h-[200px]">
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => selectPatient(patient)}
                            >
                              {patient.prenom} {patient.nom}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientFirstName">Prénom</Label>
                    <Input
                      id="patientFirstName"
                      value={newProsthetic.patientFirstName}
                      onChange={(e) => setNewProsthetic({ ...newProsthetic, patientFirstName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientLastName">Nom</Label>
                    <Input
                      id="patientLastName"
                      value={newProsthetic.patientLastName}
                      onChange={(e) => setNewProsthetic({ ...newProsthetic, patientLastName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="laboratory">Laboratoire</Label>
                  <Select 
                    onValueChange={(value) => setNewProsthetic({ ...newProsthetic, laboratory: value })}
                    value={newProsthetic.laboratory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un laboratoire" />
                    </SelectTrigger>
                    <SelectContent>
                      {laboratories.length > 0 ? (
                        laboratories.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-labs" disabled>
                          Aucun laboratoire disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prostheticType">Type de prothèse</Label>
                  <Input
                    id="prostheticType"
                    value={newProsthetic.prostheticType}
                    onChange={(e) => setNewProsthetic({ ...newProsthetic, prostheticType: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arrivalDate">Date d'arrivée prévue</Label>
                  <Input
                    id="arrivalDate"
                    type="date"
                    value={newProsthetic.arrivalDate}
                    onChange={(e) => setNewProsthetic({ ...newProsthetic, arrivalDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddProsthetic}>
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher des prothèses..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <LaboratorySettingsDialog 
        open={isLabSettingsOpen} 
        onOpenChange={setIsLabSettingsOpen} 
      />

      {filteredProsthetics.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">
            {prosthetics.length === 0 
              ? "Aucune prothèse enregistrée. Commencez par en ajouter une." 
              : "Aucune prothèse ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProsthetics.map((prosthetic) => (
            <Card key={prosthetic.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {prosthetic.patientFirstName} {prosthetic.patientLastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Laboratoire:</span>
                    <span className="text-sm">{getLaboratoryName(prosthetic.laboratory)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Type:</span>
                    <span className="text-sm">{prosthetic.prostheticType}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Date d'arrivée:</span>
                    <span className="text-sm">{new Date(prosthetic.arrivalDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-28">Statut:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prosthetic.status)}`}>
                      {getStatusLabel(prosthetic.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Select
                  value={prosthetic.status}
                  onValueChange={(value) => {
                    setProsthetics(prosthetics.map(p => 
                      p.id === prosthetic.id ? { ...p, status: value as "pending" | "arrived" | "delivered" } : p
                    ));
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Changer le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="arrived">Arrivée</SelectItem>
                    <SelectItem value="delivered">Livrée</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setProsthetics(prosthetics.filter(p => p.id !== prosthetic.id));
                    toast({
                      title: "Prothèse supprimée",
                      description: `La prothèse pour ${prosthetic.patientFirstName} ${prosthetic.patientLastName} a été supprimée.`
                    });
                  }}
                >
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProstheticManagement;
