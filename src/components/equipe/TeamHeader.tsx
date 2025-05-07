
import React from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface TeamHeaderProps {
  isAdmin: boolean;
}

const TeamHeader: React.FC<TeamHeaderProps> = ({ isAdmin }) => {
  return (
    <PageHeader 
      title="Gestion de l'Équipe" 
      icon={<Users size={20} />}
    />
  );
};

export default TeamHeader;
