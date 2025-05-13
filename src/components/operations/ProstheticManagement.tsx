import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/scroll-area";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import LaboratorySettingsDialog from "./LaboratorySettingsDialog";
import { ProstheticTable } from "./prosthetics/ProstheticTable";
import { Laboratory, Prosthetic, ProstheticFormData } from "@/types/Prosthetic";
import { TeamMember } from "@/types/TeamMember";
import { Patient } from "@/types/Patient";
import { useCabinet } from "@/hooks/useCabinet";
import { fetchTeamMembers } from "@/utils/team/teamMemberFetchUtils";

const statusLabels = {
  pending: "En attente",
  arrived: "Arrivée",
  "ready-to-ship": "Prête à l'envoi"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  arrived: "bg-blue-100 text-blue-800",
  "ready-to-ship": "bg-green-100 text-green-800"
};

const ProstheticManagement = () => {
  const [prosthetics, setProsthetics] = useState<Prosthetic[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLabSettingsOpen, setIsLabSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [dentists, setDentists] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProsthetic, setIsAddingProsthetic] = useState(false);
  const [editingProsthetic, setEditingProsthetic] = useState<Prosthetic | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [newProsthetic, setNewProsthetic] = useState<ProstheticFormData>({
    patientFirstName: "",
    patientLastName: "",
    laboratory: "",
    arrivalDate: new Date().toISOString().split("T")[0],
    departureDate: "",
    prostheticType: "",
    status: "pending",
    dentistId: ""
  });

  const fetchProsthetics = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching prosthetics...");
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setIsLoading(false);
        return;
      }
      
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.error("No user ID found in session");
        setIsLoading(false);
        return;
      }
      
      const { data: teamMemberData, error: teamMemberError } = await supabase
        .from('team_members')
        .select('cabinet_id')
        .eq('user_id', userId)
        .single();
      
      if (teamMemberError) {
        console.error("Error fetching team member data:", teamMemberError);
        setIsLoading(false);
        return;
      }
      
      const cabinetId = teamMemberData?.cabinet_id;
      
      if (!cabinetId) {
        console.error("No cabinet ID found for user");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('prosthetics')
        .select('*')
        .eq('cabinet_id', cabinetId);
      
      if (error) {
        console.error("Error fetching prosthetics:", error);
        setIsLoading(false);
        toast.error("Erreur lors du chargement des prothèses");
        return;
      }
      
      console.log("Prosthetics fetched:", data);
      
      const transformedData = data?.map(item => {
        let validStatus: "pending" | "arrived" | "ready-to-ship" = "pending";
        if (item.status === "arrived" || item.status === "ready-to-ship") {
          validStatus = item.status;
        }
        
        return {
          ...item,
          status: validStatus
        } as Prosthetic;
      }) || [];
      
      setProsthetics(transformedData);
    } catch (error) {
      console.error("Error in fetchProsthetics:", error);
      toast.error("Une erreur est survenue lors du chargement des prothèses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLaboratories = async () => {
    try {
      console.log("Fetching laboratories in ProstheticManagement...");
      const { data, error } = await supabase
        .from('laboratories')
        .select('*');
      
      if (error) {
        console.error("Error fetching laboratories:", error);
        return;
      }
      
      console.log("Laboratories fetched in ProstheticManagement:", data);
      if (data) {
        setLaboratories(data as Laboratory[]);
      }
    } catch (error) {
      console.error("Error in fetchLaboratories:", error);
    }
  };

  useEffect(() => {
    fetchProsthetics();
    const fetchPatients = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
    fetchLaboratories();
  }, []);

  useEffect(() => {
    if (!isLabSettingsOpen) {
      fetchLaboratories();
    }
  }, [isLabSettingsOpen]);

  useEffect(() => {
    if (!isDialogOpen) {
      fetchProsthetics();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    const loadDentists = async () => {
      try {
        const { data, error } = await fetchTeamMembers();
        if (error) {
          console.error("Error fetching team members:", error);
          return;
        }
        
        const dentistsList = data.filter(member => member.role === "dentiste");
        setDentists(dentistsList);
      } catch (error) {
        console.error("Error loading dentists:", error);
      }
    };
    
    loadDentists();
  }, []);

  useEffect(() => {
    if (patientSearchTerm.length > 1) {
      const searchTermLower = patientSearchTerm.toLowerCase();
      const filtered = patients.filter(patient => 
        patient.nom.toLowerCase().includes(searchTermLower) || 
        patient.prenom.toLowerCase().includes(searchTermLower)
      );
      setFilteredPatients(filtered.slice(0, 5));
    } else {
      setFilteredPatients([]);
    }
  }, [patientSearchTerm, patients]);

  const handleEditProsthetic = (prosthetic: Prosthetic) => {
    setEditingProsthetic(prosthetic);
    
    setNewProsthetic({
      patientFirstName: prosthetic.patientfirstname,
      patientLastName: prosthetic.patientlastname,
      laboratory: prosthetic.laboratory,
      arrivalDate: prosthetic.arrivaldate,
      departureDate: prosthetic.departuredate || "",
      prostheticType: prosthetic.prosthetictype,
      status: prosthetic.status,
      dentistId: prosthetic.dentistid || ""
    });
    
    setIsDialogOpen(true);
  };

  const handleAddProsthetic = async () => {
    if (!newProsthetic.patientLastName || !newProsthetic.laboratory) {
      toast.error("Veuillez remplir les champs obligatoires: Nom du patient et Laboratoire.");
      return;
    }
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        toast.error("Vous devez être connecté pour ajouter une prothèse.");
        return;
      }
      
      const { data: teamMemberData, error: teamMemberError } = await supabase
        .from('team_members')
        .select('cabinet_id')
        .eq('user_id', userId)
        .single();
      
      if (teamMemberError) {
        console.error("Error fetching team member data:", teamMemberError);
        toast.error("Impossible de récupérer les informations de votre cabinet.");
        return;
      }
      
      const cabinetId = teamMemberData?.cabinet_id;
      
      setIsAddingProsthetic(true);
      
      const prostheticData: {
        patientfirstname: string;
        patientlastname: string;
        laboratory: string;
        arrivaldate: string;
        prosthetictype: string;
        status: "pending" | "arrived" | "ready-to-ship";
        dentistid: string | null;
        cabinet_id: string | undefined;
        user_id: string;
        departuredate?: string;
      } = {
        patientfirstname: newProsthetic.patientFirstName,
        patientlastname: newProsthetic.patientLastName,
        laboratory: newProsthetic.laboratory,
        arrivaldate: newProsthetic.arrivalDate,
        prosthetictype: newProsthetic.prostheticType || "",
        status: newProsthetic.status,
        dentistid: newProsthetic.dentistId || null,
        cabinet_id: cabinetId,
        user_id: userId
      };
      
      if (newProsthetic.departureDate && newProsthetic.departureDate.trim() !== '') {
        prostheticData.departuredate = newProsthetic.departureDate;
      }
      
      console.log("Sending prosthetic data:", prostheticData);
      
      if (editingProsthetic) {
        const { data, error } = await supabase
          .from('prosthetics')
          .update(prostheticData)
          .eq('id', editingProsthetic.id)
          .select();
        
        if (error) {
          console.error("Error updating prosthetic:", error);
          toast.error(error.message || "Une erreur est survenue lors de la mise à jour de la prothèse.");
          return;
        }
        
        console.log("Prosthetic updated:", data);
        toast.success(`La prothèse pour ${newProsthetic.patientFirstName} ${newProsthetic.patientLastName} a été mise à jour.`);
      } else {
        const { data, error } = await supabase
          .from('prosthetics')
          .insert(prostheticData)
          .select();
        
        if (error) {
          console.error("Error adding prosthetic:", error);
          toast.error(error.message || "Une erreur est survenue lors de l'ajout de la prothèse.");
          return;
        }
        
        console.log("Prosthetic added:", data);
        toast.success(`La prothèse pour ${newProsthetic.patientFirstName} ${newProsthetic.patientLastName} a été ajoutée.`);
      }
      
      setNewProsthetic({
        patientFirstName: "",
        patientLastName: "",
        laboratory: "",
        arrivalDate: new Date().toISOString().split("T")[0],
        departureDate: "",
        prostheticType: "",
        status: "pending",
        dentistId: ""
      });
      
      setEditingProsthetic(null);
      setIsDialogOpen(false);
      
      fetchProsthetics();
    } catch (error: any) {
      console.error("Error in handleAddProsthetic:", error);
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsAddingProsthetic(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "pending" | "arrived" | "ready-to-ship") => {
    try {
      const { error } = await supabase
        .from('prosthetics')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating prosthetic status:", error);
        toast.error("Impossible de mettre à jour le statut de la prothèse.");
        return;
      }
      
      setProsthetics(prosthetics.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
      
      toast.success("Le statut de la prothèse a été mis à jour.");
    } catch (error) {
      console.error("Error in handleUpdateStatus:", error);
    }
  };

  const handleDeleteProsthetic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prosthetics')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting prosthetic:", error);
        toast.error("Impossible de supprimer la prothèse.");
        return;
      }
      
      setProsthetics(prosthetics.filter(p => p.id !== id));
      
      toast.success("La prothèse a été supprimée avec succès.");
    } catch (error) {
      console.error("Error in handleDeleteProsthetic:", error);
    }
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
      case "ready-to-ship": return "Prête à l'envoi";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "arrived": return "bg-blue-100 text-blue-800";
      case "ready-to-ship": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLaboratoryName = (labId: string) => {
    const laboratory = laboratories.find(lab => lab.id === labId);
    return laboratory ? laboratory.name : labId;
  };

  const getDentistName = (dentistId: string | undefined) => {
    if (!dentistId) return "";
    const dentist = dentists.find(d => d.id === dentistId);
    return dentist ? `${dentist.firstName} ${dentist.lastName}` : "";
  };

  const filteredProsthetics = prosthetics.filter(prosthetic => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const labName = getLaboratoryName(prosthetic.laboratory).toLowerCase();
    const patientName = `${prosthetic.patientfirstname} ${prosthetic.patientlastname}`.toLowerCase();
    const dentistName = getDentistName(prosthetic.dentistid).toLowerCase();
    
    return (
      patientName.includes(searchLower) ||
      labName.includes(searchLower) ||
      dentistName.includes(searchLower) ||
      prosthetic.prosthetictype.toLowerCase().includes(searchLower) ||
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProsthetic(null);
              setNewProsthetic({
                patientFirstName: "",
                patientLastName: "",
                laboratory: "",
                arrivalDate: new Date().toISOString().split("T")[0],
                departureDate: "",
                prostheticType: "",
                status: "pending",
                dentistId: ""
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>Ajouter une prothèse</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProsthetic ? "Modifier la prothèse" : "Nouvelle prothèse"}</DialogTitle>
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
                        <ScrollArea className="h-[200px]">
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => selectPatient(patient)}
                            >
                              {patient.prenom} {patient.nom}
                            </div>
                          ))}
                        </ScrollArea>
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
                    <Label htmlFor="patientLastName">Nom *</Label>
                    <Input
                      id="patientLastName"
                      value={newProsthetic.patientLastName}
                      onChange={(e) => setNewProsthetic({ ...newProsthetic, patientLastName: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dentist">Dentiste</Label>
                  <Select 
                    onValueChange={(value) => setNewProsthetic({ ...newProsthetic, dentistId: value })}
                    value={newProsthetic.dentistId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un dentiste" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.length > 0 ? (
                        dentists.map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id}>
                            {dentist.firstName} {dentist.lastName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-dentists" disabled>
                          Aucun dentiste disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="laboratory">Laboratoire *</Label>
                  <Select 
                    onValueChange={(value) => setNewProsthetic({ ...newProsthetic, laboratory: value })}
                    value={newProsthetic.laboratory}
                    required
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
                <div className="grid gap-2">
                  <Label htmlFor="departureDate">Date de départ prévue</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    value={newProsthetic.departureDate || ""}
                    onChange={(e) => setNewProsthetic({ ...newProsthetic, departureDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select 
                    onValueChange={(value: "pending" | "arrived" | "ready-to-ship") => 
                      setNewProsthetic({ ...newProsthetic, status: value })
                    }
                    value={newProsthetic.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="arrived">Arrivée</SelectItem>
                      <SelectItem value="ready-to-ship">Prête à l'envoi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500 mt-2">* Champs obligatoires</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProsthetic(null);
                }}>
                  Annuler
                </Button>
                <LoadingButton 
                  isLoading={isAddingProsthetic} 
                  loadingText={editingProsthetic ? "Mise à jour en cours..." : "Ajout en cours..."}
                  onClick={handleAddProsthetic}
                >
                  {editingProsthetic ? "Mettre à jour" : "Ajouter"}
                </LoadingButton>
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

      {isLoading ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">Chargement des prothèses...</p>
        </div>
      ) : prosthetics.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">
            {prosthetics.length === 0 
              ? "Aucune prothèse enregistrée. Commencez par en ajouter une." 
              : "Aucune prothèse ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="w-full">
          <ProstheticTable
            prosthetics={filteredProsthetics}
            laboratories={laboratories}
            dentists={dentists}
            onUpdateStatus={handleUpdateStatus}
            onDeleteProsthetic={handleDeleteProsthetic}
            onEditProsthetic={handleEditProsthetic}
            statusLabels={statusLabels}
            statusColors={statusColors}
          />
        </div>
      )}
    </div>
  );
};

export default ProstheticManagement;
