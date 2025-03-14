
import React from "react";
import { User } from "lucide-react";

const EmptyTeam: React.FC = () => {
  return (
    <div className="text-center py-12">
      <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-600 mb-1">Aucun membre d'équipe</h3>
      <p className="text-gray-500">
        Cliquez sur "Ajouter un membre" pour commencer à constituer votre équipe.
      </p>
    </div>
  );
};

export default EmptyTeam;
