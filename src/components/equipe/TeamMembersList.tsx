
import React from "react";
import { User } from "lucide-react";
import { TeamMember } from "@/types/TeamMember";
import TeamMemberCard from "./TeamMemberCard";

interface TeamMembersListProps {
  members: TeamMember[];
  roleFilter: string;
  roleTitle: string;
  onViewMember: (member: TeamMember) => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  roleFilter,
  roleTitle,
  onViewMember
}) => {
  const filteredMembers = members.filter(member => member.role === roleFilter);

  return (
    <div>
      <h2 className="text-lg font-medium text-[#5C4E3D] mb-3">{roleTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(member => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onManageMember={onViewMember}
            isSelected={false}
            onSelect={() => {}} 
          />
        ))}
      </div>
      {filteredMembers.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucun {roleTitle.toLowerCase()} dans l'équipe</p>
        </div>
      )}
    </div>
  );
};

export default TeamMembersList;
