
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAccessControl, ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";

// Import our components
import AddMemberDialog from "@/components/equipe/AddMemberDialog";
import MemberDetailsDialog from "@/components/equipe/MemberDetailsDialog"; // This import path stays the same
import UploadContractDialog from "@/components/equipe/UploadContractDialog";
import TeamHeader from "@/components/equipe/TeamHeader";
import TeamFilter from "@/components/equipe/TeamFilter";
import TeamMembersTable from "@/components/equipe/TeamMembersTable";
import { useTeamManager } from "@/components/equipe/useTeamManager";

const Equipe = () => {
  const teamManager = useTeamManager();
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto max-h-screen">
        <TeamHeader 
          isAdmin={teamManager.isAdmin} 
          onAddMember={() => teamManager.setIsAddMemberOpen(true)}
        />

        <TeamFilter 
          searchQuery={teamManager.searchQuery}
          setSearchQuery={teamManager.setSearchQuery}
          isAdmin={teamManager.isAdmin}
          onAddMember={() => teamManager.setIsAddMemberOpen(true)}
        />
        
        <TeamMembersTable 
          filteredMembers={teamManager.filteredMembers}
          isLoading={teamManager.isLoading}
          selectAll={teamManager.selectAll}
          selectedMembers={teamManager.selectedMembers}
          ACCOUNT_OWNER_EMAIL={ACCOUNT_OWNER_EMAIL}
          handleSelectAll={teamManager.handleSelectAll}
          handleSelectMember={teamManager.handleSelectMember}
          handleViewMember={teamManager.handleViewMember}
        />

        {/* Dialogs */}
        <AddMemberDialog 
          open={teamManager.isAddMemberOpen}
          onOpenChange={teamManager.setIsAddMemberOpen}
          newMember={teamManager.newMember}
          setNewMember={teamManager.setNewMember}
          onAddMember={teamManager.handleAddMember}
        />

        <MemberDetailsDialog 
          open={teamManager.isViewMemberOpen}
          onOpenChange={teamManager.setIsViewMemberOpen}
          member={teamManager.selectedMember}
          onDelete={teamManager.handleDeleteMember}
          onUploadContract={teamManager.handleUploadContract}
          onOpenUploadDialog={() => {
            teamManager.setIsUploadContractOpen(true);
          }}
          onToggleAdmin={teamManager.handleToggleAdmin}
          onUpdateSpecialty={teamManager.handleUpdateSpecialty}
          onUpdateMember={teamManager.handleUpdateMember}
        />

        <UploadContractDialog 
          open={teamManager.isUploadContractOpen}
          onOpenChange={teamManager.setIsUploadContractOpen}
          onUploadContract={teamManager.handleUploadContract}
        />
      </div>
    </div>
  );
};

export default Equipe;

