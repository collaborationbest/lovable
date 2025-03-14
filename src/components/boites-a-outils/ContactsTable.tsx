
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Contact } from "./types";

interface ContactsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  cabinetId: string | null;
  searchQuery: string;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactsTable = ({ 
  contacts, 
  isLoading, 
  cabinetId, 
  searchQuery, 
  onEdit, 
  onDelete 
}: ContactsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Société</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead className="hidden md:table-cell">Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              Chargement des contacts...
            </TableCell>
          </TableRow>
        ) : !cabinetId ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              Aucun cabinet sélectionné.
            </TableCell>
          </TableRow>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.company}</TableCell>
              <TableCell>{contact.firstName} {contact.lastName}</TableCell>
              <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
              <TableCell>{contact.phone}</TableCell>
              <TableCell className="hidden md:table-cell capitalize">{contact.type}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(contact)}>
                    <Pencil className="h-4 w-4 text-[#5C4E3D]" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(contact.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              {searchQuery 
                ? "Aucun contact ne correspond à votre recherche." 
                : "Aucun contact n'a été ajouté."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ContactsTable;
