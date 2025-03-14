
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TeamFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdmin: boolean;
  onAddMember: () => void;
}

const TeamFilter: React.FC<TeamFilterProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  isAdmin, 
  onAddMember 
}) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher un membre..."
          className="pl-10 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {isAdmin && (
        <Button 
          className="bg-[#B88E23] hover:bg-[#927219] ml-auto"
          onClick={onAddMember}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      )}
    </div>
  );
};

export default TeamFilter;
