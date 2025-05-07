import { useState, useEffect, useRef } from "react";
import { TeamMember } from "@/types/TeamMember";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { removeDuplicateTeamMembers } from "@/utils/team/teamMemberDeduplicationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamManager = () => {
  const { isAdmin, userEmail, isAccountOwner } = useAccessControl();
  const teamMembersHook = useTeamMembers([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<Record<string, boolean>>({});
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendingEmailFor, setResendingEmailFor] = useState<string | null>(null);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  
  // Add a flag to prevent concurrent verification checks
  const isVerificationCheckInProgress = useRef(false);
  // Add debounce timer ref
  const verificationCheckTimer = useRef<number | null>(null);
  // Add last check timestamp to prevent too frequent checks
  const lastVerificationCheckTime = useRef<number>(0);
  // Cache expiration time in milliseconds (2 minutes)
  const CACHE_EXPIRATION_TIME = 2 * 60 * 1000;

  // Use the utility function instead of local deduplication
  const filteredMembers = removeDuplicateTeamMembers(teamMembersHook.teamMembers).filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.contact?.toLowerCase() || "";
    const role = member.role.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query) || role.includes(query);
  });

  // Fetch email verification status
  useEffect(() => {
    const fetchEmailVerification = async () => {
      // Exit conditions:
      // 1. Not admin or account owner
      // 2. Another verification check is in progress
      // 3. No members to check
      // 4. Last check was too recent (less than cache expiration time ago)
      if (
        (!isAdmin && !isAccountOwner) || 
        isVerificationCheckInProgress.current || 
        filteredMembers.length === 0 ||
        (Date.now() - lastVerificationCheckTime.current < CACHE_EXPIRATION_TIME)
      ) {
        return;
      }
      
      try {
        // Set flag to true to prevent concurrent checks
        isVerificationCheckInProgress.current = true;
        setIsCheckingVerification(true);
        
        // Get session to ensure we're authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsCheckingVerification(false);
          isVerificationCheckInProgress.current = false;
          return;
        }
        
        const memberEmails = filteredMembers
          .map(member => member.contact?.toLowerCase())
          .filter(email => email) as string[];
          
        if (memberEmails.length === 0) {
          setIsCheckingVerification(false);
          isVerificationCheckInProgress.current = false;
          return;
        }
        
        console.log("Checking email verification status for", memberEmails.length, "members");
        
        // Call the edge function to fetch verification status
        const results = await supabase.functions.invoke('check-email-verification', {
          body: { emails: memberEmails }
        });
        
        if (results.error) {
          console.error("Error fetching email verification status:", results.error);
          setIsCheckingVerification(false);
          isVerificationCheckInProgress.current = false;
          return;
        }
        
        if (results.data) {
          console.log("Email verification statuses received:", results.data.statuses);
          setEmailVerificationStatus(results.data.statuses);
          // Update last check timestamp
          lastVerificationCheckTime.current = Date.now();
        }
      } catch (error) {
        console.error("Failed to fetch email verification status:", error);
      } finally {
        setIsCheckingVerification(false);
        // Reset the flag to allow future verification checks
        isVerificationCheckInProgress.current = false;
      }
    };
    
    // Clear any existing timer
    if (verificationCheckTimer.current !== null) {
      clearTimeout(verificationCheckTimer.current);
    }
    
    // Only start verification check if we have members and proper permissions
    if (filteredMembers.length > 0 && (isAdmin || isAccountOwner)) {
      // Debounce the verification check to prevent too many calls
      verificationCheckTimer.current = window.setTimeout(fetchEmailVerification, 2000);
    }
    
    return () => {
      if (verificationCheckTimer.current !== null) {
        clearTimeout(verificationCheckTimer.current);
      }
    };
  }, [filteredMembers, isAdmin, isAccountOwner]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(memberId => memberId !== id));
      setSelectAll(false);
    } else {
      setSelectedMembers([...selectedMembers, id]);
      if (selectedMembers.length + 1 === filteredMembers.length) {
        setSelectAll(true);
      }
    }
  };
  
  const handleResendEmail = async (email: string) => {
    if (!email || isResendingEmail) return;
    
    try {
      setIsResendingEmail(true);
      setResendingEmailFor(email);
      toast.info(`Envoi de l'email de vérification à ${email} en cours...`);
      
      console.log("Calling resend-verification-email function for:", email);
      const { data, error } = await supabase.functions.invoke('resend-verification-email', {
        body: { email }
      });
      
      if (error) {
        console.error("Error invoking resend-verification-email function:", error);
        throw new Error(error.message || "Échec de l'envoi de l'email");
      }
      
      console.log("Resend email response:", data);
      
      if (!data?.success) {
        const errorMessage = data?.message || "Échec de l'envoi de l'email de vérification";
        console.error("Function returned error:", errorMessage);
        
        if (data?.notFound) {
          toast.error(`L'utilisateur avec l'email ${email} n'a pas été trouvé dans le système.`);
        } else if (data?.rateLimited) {
          toast.warning("Veuillez attendre quelques minutes avant de renvoyer un email.");
        } else {
          throw new Error(errorMessage);
        }
        return;
      }
      
      // Handle already verified case
      if (data.alreadyVerified) {
        // Update the local state to reflect the email is verified
        setEmailVerificationStatus(prev => ({
          ...prev,
          [email.toLowerCase()]: true
        }));
        
        toast.success(`L'email ${email} est déjà vérifié`);
      } else {
        toast.success(`Email de vérification envoyé à ${email}`);
      }
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      toast.error(error.message || "Échec de l'envoi de l'email de vérification");
    } finally {
      setIsResendingEmail(false);
      setResendingEmailFor(null);
    }
  };

  return {
    ...teamMembersHook,
    isAdmin,
    userEmail,
    isAccountOwner,
    searchQuery,
    setSearchQuery,
    selectedMembers,
    setSelectedMembers,
    selectAll,
    setSelectAll,
    filteredMembers,
    handleSelectAll,
    handleSelectMember,
    isSubmitting: teamMembersHook.isSubmitting,
    emailVerificationStatus,
    handleResendEmail,
    isResendingEmail,
    resendingEmailFor,
    isCheckingVerification
  };
};
