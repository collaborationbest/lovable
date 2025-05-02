
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Credential } from "./types";
import { Eye, EyeOff, Pencil, Trash2, ExternalLink } from "lucide-react";

interface CredentialsTableProps {
  credentials: Credential[];
  isLoading: boolean;
  cabinetId: string | null;
  searchQuery: string;
  onEdit: (credential: Credential) => void;
  onDelete: (id: string) => void;
}

const CredentialsTable: React.FC<CredentialsTableProps> = ({
  credentials,
  isLoading,
  searchQuery,
  onEdit,
  onDelete
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  const filteredCredentials = credentials.filter(credential => 
    credential.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (credential.website?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (credential.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );
  
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const formatWebsiteUrl = (url: string) => {
    if (!url) return "";
    
    // Remove leading and trailing whitespace
    url = url.trim();
    
    // Check if URL already has a protocol
    if (!/^https?:\/\//i.test(url)) {
      // If URL doesn't have a protocol, add https://
      return `https://${url}`;
    }
    
    return url;
  };
  
  return (
    <div className="rounded-md border">
      <div className="p-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-[#5C4E3D]/50" />
        <Input
          placeholder="Rechercher..."
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-[#5C4E3D]"
          value={searchQuery}
          onChange={(e) => {
            // This will be handled by the parent component
          }}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Société</TableHead>
            <TableHead className="w-[250px]">Site web</TableHead>
            <TableHead className="w-[250px]">Email / Identifiant</TableHead>
            <TableHead className="w-[150px]">Mot de passe</TableHead>
            <TableHead className="text-right w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Chargement...
              </TableCell>
            </TableRow>
          ) : filteredCredentials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                {searchQuery ? "Aucun résultat trouvé" : "Aucun accès enregistré"}
              </TableCell>
            </TableRow>
          ) : (
            filteredCredentials.map((credential) => (
              <TableRow key={credential.id}>
                <TableCell className="font-medium">{credential.company}</TableCell>
                <TableCell>
                  {credential.website && (
                    <div className="flex items-center">
                      <span className="max-w-[180px] truncate">{credential.website}</span>
                      <a 
                        href={formatWebsiteUrl(credential.website)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-[#B88E23] hover:text-[#8A6A1B]"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  )}
                </TableCell>
                <TableCell>{credential.email}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="max-w-[100px] truncate">
                      {visiblePasswords[credential.id] ? credential.password : "••••••••"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1"
                      onClick={() => togglePasswordVisibility(credential.id)}
                    >
                      {visiblePasswords[credential.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(credential)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(credential.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CredentialsTable;
