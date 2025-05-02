
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserCabinetId } from "@/integrations/supabase/cabinetUtils";
import { Contact, ContactFormData } from "./types";

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newContact, setNewContact] = useState<ContactFormData>({
    company: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    type: "comptable"
  });
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cabinetId, setCabinetId] = useState<string | null>(null);

  // Fetch current cabinet ID
  useEffect(() => {
    const fetchCabinetId = async () => {
      const id = await getUserCabinetId();
      setCabinetId(id);
    };
    
    fetchCabinetId();
  }, []);

  const fetchContacts = async () => {
    if (!cabinetId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('cabinet_id', cabinetId);
      
      if (error) {
        throw error;
      }

      const formattedContacts = data.map(contact => ({
        id: contact.id,
        company: contact.company,
        firstName: contact.first_name,
        lastName: contact.last_name,
        phone: contact.phone || "",
        email: contact.email || "",
        type: contact.type,
        cabinet_id: contact.cabinet_id
      }));
      
      setContacts(formattedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Impossible de charger les contacts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cabinetId) {
      fetchContacts();
    }
  }, [cabinetId]);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleAddContact = async () => {
    if (!cabinetId) {
      toast.error("Aucun cabinet sélectionné.");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          company: newContact.company,
          first_name: newContact.firstName,
          last_name: newContact.lastName,
          phone: newContact.phone,
          email: newContact.email,
          type: newContact.type,
          cabinet_id: cabinetId
        }])
        .select();

      if (error) {
        throw error;
      }

      const newContactWithId: Contact = {
        id: data[0].id,
        company: data[0].company,
        firstName: data[0].first_name,
        lastName: data[0].last_name,
        phone: data[0].phone || "",
        email: data[0].email || "",
        type: data[0].type,
        cabinet_id: data[0].cabinet_id
      };
      
      setContacts([...contacts, newContactWithId]);
      
      setNewContact({
        company: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        type: "comptable"
      });
      
      setIsDialogOpen(false);
      
      toast.success("Le contact a été ajouté avec succès.");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Impossible d'ajouter le contact.");
    }
  };

  const handleEditContact = async () => {
    if (!editingContact || !cabinetId) return;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          company: editingContact.company,
          first_name: editingContact.firstName,
          last_name: editingContact.lastName,
          phone: editingContact.phone,
          email: editingContact.email,
          type: editingContact.type,
          cabinet_id: cabinetId
        })
        .eq('id', editingContact.id);

      if (error) {
        throw error;
      }

      const updatedContacts = contacts.map(contact => 
        contact.id === editingContact.id ? editingContact : contact
      );
      
      setContacts(updatedContacts);
      setEditingContact(null);
      setIsDialogOpen(false);
      
      toast.success("Le contact a été modifié avec succès.");
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Impossible de modifier le contact.");
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      const updatedContacts = contacts.filter(contact => contact.id !== id);
      setContacts(updatedContacts);
      
      toast.success("Le contact a été supprimé avec succès.");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Impossible de supprimer le contact.");
    }
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  return {
    contacts: filteredContacts,
    newContact,
    editingContact,
    isDialogOpen,
    isLoading,
    cabinetId,
    searchQuery,
    setSearchQuery,
    setNewContact,
    setEditingContact,
    setIsDialogOpen,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    openEditDialog
  };
};
