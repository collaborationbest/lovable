
import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useContacts } from "@/components/boites-a-outils/useContacts";
import ContactFormDialog from "@/components/boites-a-outils/ContactFormDialog";
import ContactsTable from "@/components/boites-a-outils/ContactsTable";
import PageHeader from "@/components/boites-a-outils/PageHeader";

const BoitesAOutils = () => {
  const {
    contacts,
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
  } = useContacts();

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    if (editingContact) setEditingContact(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <Sidebar />
      <div className="flex-1 h-screen flex flex-col items-center justify-start px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-6xl mx-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <PageHeader 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
            />

            <Card>
              <CardContent className="p-0">
                <ContactsTable 
                  contacts={contacts}
                  isLoading={isLoading}
                  cabinetId={cabinetId}
                  searchQuery={searchQuery}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteContact}
                />
              </CardContent>
              <CardFooter className="border-t pt-4 text-sm text-gray-500">
                {contacts.length} contact(s) au total
              </CardFooter>
            </Card>

            <ContactFormDialog 
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              editingContact={editingContact}
              newContact={newContact}
              onNewContactChange={setNewContact}
              onEditingContactChange={setEditingContact}
              onSave={editingContact ? handleEditContact : handleAddContact}
              onCancel={handleDialogCancel}
            />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default BoitesAOutils;
