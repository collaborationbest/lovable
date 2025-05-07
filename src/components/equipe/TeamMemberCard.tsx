
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { TeamMember } from "@/types/TeamMember";
import { formatRole } from "@/utils/teamMemberUtils";

interface TeamMemberCardProps {
  member: TeamMember;
  onManageMember: (member: TeamMember) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Map of color IDs to hex values
const colorMap: Record<string, string> = {
  blue: "#1a73e8",
  red: "#e53935",
  green: "#43a047",
  purple: "#8e24aa",
  yellow: "#f9a825",
  teal: "#00897b",
  orange: "#ef6c00",
  pink: "#d81b60",
  cyan: "#00acc1",
  brown: "#6d4c41",
};

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ 
  member, 
  onManageMember, 
  isSelected, 
  onSelect 
}) => {
  const borderColor = member.colorId ? colorMap[member.colorId] : '';
  
  return (
    <Card 
      className={`border transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{ borderLeftColor: borderColor, borderLeftWidth: borderColor ? '4px' : '1px' }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">
                {member.role === "dentiste" ? "Dr. " : ""}
                {member.firstName} {member.lastName}
                {member.isAdmin && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">{formatRole(member.role)}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onManageMember(member)}
          >
            Gérer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
