
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, UserCheck } from "lucide-react";
import { TeamMember, MemberRole } from "@/types/TeamMember";

interface TeamMemberCardProps {
  member: TeamMember;
  onClick: (member: TeamMember) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ 
  member,
  onClick
}) => {
  // Fonction pour obtenir les initiales selon le rôle
  const getRoleInitials = (role: MemberRole): string => {
    switch (role) {
      case "dentiste": return "MD";
      case "assistante": return "AD";
      case "secrétaire": return "SE";
      default: return "";
    }
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer rounded-xl border border-gray-100"
      onClick={() => onClick(member)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-semibold" 
               style={{ background: 'linear-gradient(to bottom right, #e9f0ff, #c7d8ff)' }}>
            <span className="text-blue-600">{getRoleInitials(member.role)}</span>
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className="font-medium text-gray-900 text-lg">
              {member.role === "dentiste" ? "Dr " : ""}{member.lastName} {member.firstName}
            </h3>
            {member.contact && (
              <div className="text-sm text-gray-500 flex items-center mt-1 truncate">
                <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
                <span className="truncate">{member.contact}</span>
              </div>
            )}
          </div>
          
          <div className="ml-auto flex-shrink-0">
            {member.contractFile ? (
              <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center">
                <UserCheck className="h-4 w-4 mr-1.5" />
                <span className="font-medium text-sm">Contrat ✓</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center">
                <span className="font-medium text-sm">Sans contrat</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
