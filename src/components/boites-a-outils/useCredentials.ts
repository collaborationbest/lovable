
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Credential, CredentialFormData } from "./types";
import { useUserProfile } from "@/hooks/useUserProfile";
import { generateRandomPassword } from "@/utils/passwordUtils";

export const useCredentials = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCredential, setNewCredential] = useState<Partial<CredentialFormData>>({
    company: "",
    website: "",
    email: "",
    password: ""
  });
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const { profile } = useUserProfile();
  
  // Get cabinet_id from the profile, with a fallback to null
  const cabinetId = profile?.id || null;
  
  const fetchCredentials = async () => {
    if (!cabinetId) return;
    
    setIsLoading(true);
    try {
      // Using explicit type casting to overcome TypeScript issues
      const { data, error } = await (supabase
        .from('credentials') as any)
        .select('*')
        .eq('cabinet_id', cabinetId);
      
      if (error) throw error;
      
      // Safely cast the data to Credential[]
      setCredentials(data ? data as unknown as Credential[] : []);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les accès",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (cabinetId) {
      fetchCredentials();
    }
  }, [cabinetId]);
  
  const handleAddCredential = async () => {
    if (!cabinetId) return;
    
    if (!newCredential.company || !newCredential.password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await (supabase
        .from('credentials') as any)
        .insert([
          {
            ...newCredential,
            cabinet_id: cabinetId
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Safely cast the returned data to Credential[]
      const newCredentials = data ? data as unknown as Credential[] : [];
      setCredentials(prev => [...prev, ...newCredentials]);
      
      // Reset form
      setNewCredential({
        company: "",
        website: "",
        email: "",
        password: ""
      });
      
      setIsDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Nouvel accès ajouté avec succès"
      });
      
      // Refresh the list
      fetchCredentials();
      
    } catch (error) {
      console.error("Error adding credential:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'accès",
        variant: "destructive"
      });
    }
  };
  
  const handleEditCredential = async () => {
    if (!cabinetId || !editingCredential) return;
    
    if (!editingCredential.company || !editingCredential.password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await (supabase
        .from('credentials') as any)
        .update({
          company: editingCredential.company,
          website: editingCredential.website,
          email: editingCredential.email,
          password: editingCredential.password,
          notes: editingCredential.notes
        })
        .eq('id', editingCredential.id)
        .eq('cabinet_id', cabinetId);
      
      if (error) throw error;
      
      setEditingCredential(null);
      setIsDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Accès mis à jour avec succès"
      });
      
      // Refresh the list
      fetchCredentials();
      
    } catch (error) {
      console.error("Error updating credential:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'accès",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteCredential = async (id: string) => {
    if (!cabinetId) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet accès ?")) {
      return;
    }
    
    try {
      const { error } = await (supabase
        .from('credentials') as any)
        .delete()
        .eq('id', id)
        .eq('cabinet_id', cabinetId);
      
      if (error) throw error;
      
      setCredentials(credentials.filter(c => c.id !== id));
      
      toast({
        title: "Succès",
        description: "Accès supprimé avec succès"
      });
      
    } catch (error) {
      console.error("Error deleting credential:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'accès",
        variant: "destructive"
      });
    }
  };
  
  const openEditDialog = (credential: Credential) => {
    setEditingCredential(credential);
    setIsDialogOpen(true);
  };
  
  const generatePassword = () => {
    const password = generateRandomPassword();
    
    if (editingCredential) {
      setEditingCredential({
        ...editingCredential,
        password
      });
    } else {
      setNewCredential({
        ...newCredential,
        password
      });
    }
  };
  
  return {
    credentials,
    newCredential,
    editingCredential,
    isDialogOpen,
    isLoading,
    cabinetId,
    searchQuery,
    setSearchQuery,
    setNewCredential,
    setEditingCredential,
    setIsDialogOpen,
    handleAddCredential,
    handleEditCredential,
    handleDeleteCredential,
    openEditDialog,
    generatePassword
  };
};
