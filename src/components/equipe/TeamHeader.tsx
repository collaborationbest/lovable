
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TeamHeaderProps {
  isAdmin: boolean;
  onAddMember: () => void;
}

const TeamHeader: React.FC<TeamHeaderProps> = ({ isAdmin, onAddMember }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion de l'Équipe</h1>
      <p className="text-gray-600">
        Gérez les membres de votre équipe. 
        <a href="#" className="text-blue-600 hover:underline ml-1">En savoir plus</a>
      </p>
    </div>
  );
};

export default TeamHeader;
