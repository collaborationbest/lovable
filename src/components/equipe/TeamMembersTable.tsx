
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UserRound, Mail, AlertCircle, Loader2, HelpCircle, CheckCircle2 } from "lucide-react";
import { TeamMember } from "@/types/TeamMember";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMembersTableProps {
  filteredMembers: TeamMember[];
  isLoading: boolean;
  selectAll: boolean;
  selectedMembers: string[];
  ACCOUNT_OWNER_EMAIL: string;
  handleSelectAll: () => void;
  handleSelectMember: (id: string) => void;
  handleViewMember: (member: TeamMember) => void;
  handleResendEmail?: (email: string) => void;
  emailVerificationStatus?: Record<string, boolean>;
  isResendingEmail?: boolean;
  resendingEmailFor?: string | null;
  isCheckingVerification?: boolean;
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
  handleResendEmail,
  emailVerificationStatus = {},
  isResendingEmail = false,
  resendingEmailFor = null,
  isCheckingVerification = false,
}) => {
  // Helper function to determine verification status
  const getVerificationStatus = (email: string | undefined) => {
    if (!email) return { status: 'unknown', display: 'Inconnu' };
    
    const normalizedEmail = email.toLowerCase();
    
    // Check if the email is the account owner's (always verified)
    if (normalizedEmail === ACCOUNT_OWNER_EMAIL.toLowerCase()) {
      return { status: 'verified', display: 'Email vérifié' };
    }
    
    if (isCheckingVerification) {
      return { 
        status: 'checking', 
        display: 'Vérification...' 
      };
    }
    
    if (emailVerificationStatus[normalizedEmail] === undefined) {
      return { 
        status: 'unknown', 
        display: 'Inconnu' 
      };
    }
    
    return emailVerificationStatus[normalizedEmail] 
      ? { status: 'verified', display: 'Email vérifié' }
      : { status: 'unverified', display: 'Non vérifié' };
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table headers */}
      <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 bg-gray-50">
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
        <div className="text-sm font-medium text-gray-500 text-center">Statut</div>
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
            {filteredMembers.map((member) => {
              const memberEmail = member.contact?.toLowerCase();
              const verificationStatus = getVerificationStatus(memberEmail);
              
              return (
                <div key={member.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50">
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
                  <div className="flex items-center justify-center">
                    {verificationStatus.status === 'checking' && (
                      <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Vérification...
                      </span>
                    )}
                    
                    {verificationStatus.status === 'verified' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Email vérifié
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cet utilisateur a vérifié son email</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {verificationStatus.status === 'unverified' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Non vérifié
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cet utilisateur n'a pas vérifié son email</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {verificationStatus.status === 'unknown' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium flex items-center">
                              <HelpCircle className="h-3 w-3 mr-1" />
                              Inconnu
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Statut de vérification inconnu</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    {member.contact && 
                     verificationStatus.status === 'unverified' && 
                     handleResendEmail && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleResendEmail(member.contact || '')}
                        disabled={isResendingEmail}
                      >
                        {isResendingEmail && resendingEmailFor === member.contact ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            Relancer
                          </>
                        )}
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      className="text-gray-700"
                      onClick={() => handleViewMember(member)}
                    >
                      Gérer
                    </Button>
                  </div>
                </div>
              );
            })}
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
