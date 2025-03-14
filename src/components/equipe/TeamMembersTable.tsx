
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { TeamMember } from "@/types/TeamMember";
import { Spinner } from "@/components/ui/spinner";

interface TeamMembersTableProps {
  filteredMembers: TeamMember[];
  isLoading: boolean;
  selectAll: boolean;
  selectedMembers: string[];
  ACCOUNT_OWNER_EMAIL: string;
  handleSelectAll: () => void;
  handleSelectMember: (id: string) => void;
  handleViewMember: (member: TeamMember) => void;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  filteredMembers,
  isLoading,
  selectAll,
  selectedMembers,
  ACCOUNT_OWNER_EMAIL,
  handleSelectAll,
  handleSelectMember,
  handleViewMember,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table headers */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <Checkbox 
            id="select-all" 
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            className="ml-1"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-gray-500 ml-2">
            Select all
          </label>
        </div>
        <div className="text-sm font-medium text-gray-500">Nom</div>
        <div className="text-sm font-medium text-gray-500 text-center">Rôle</div>
        <div className="text-sm font-medium text-gray-500 text-right">Actions</div>
      </div>

      {/* Table body */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-8 w-8 text-[#B88E23]" />
            <span className="ml-3 text-gray-600">Chargement de l'équipe...</span>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50">
                <div className="flex items-center ml-1">
                  <Checkbox 
                    id={`select-${member.id}`}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => handleSelectMember(member.id)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.role === "dentiste" ? "Dr. " : ""}{member.firstName} {member.lastName}
                      {member.contact?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                          Propriétaire
                        </span>
                      )}
                    </p>
                    <p className="text-gray-500 text-sm">{member.contact}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline"
                    className="text-gray-700"
                    onClick={() => handleViewMember(member)}
                  >
                    Gérer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun membre ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersTable;
