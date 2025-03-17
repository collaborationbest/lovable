
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Doctor } from "@/types/Doctor";

interface UseProfileCheckProps {
  doctors: Doctor[];
}

interface UseProfileCheckResult {
  isLoading: boolean;
  showCabinetProfile: boolean;
}

export const useProfileCheck = ({ doctors }: UseProfileCheckProps): UseProfileCheckResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [showCabinetProfile, setShowCabinetProfile] = useState(false);
  const profileCheckComplete = useRef(false);

  useEffect(() => {
    if (profileCheckComplete.current) {
      return;
    }
    
    const checkUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        // First check if profile is configured in localStorage
        const profileConfigured = localStorage.getItem('profileConfigured');
        
        if (profileConfigured === 'true') {
          console.log('Profile already configured according to localStorage');
          setShowCabinetProfile(false);
          profileCheckComplete.current = true;
          setIsLoading(false);
          return;
        }
        
        // Check if doctors data exists first, to avoid database calls if possible
        const hasDoctors = doctors && Array.isArray(doctors) && doctors.length > 0;
        
        if (hasDoctors) {
          // Doctors exist, mark as configured
          console.log('Doctors found, marking profile as configured');
          localStorage.setItem('profileConfigured', 'true');
          setShowCabinetProfile(false);
          profileCheckComplete.current = true;
          setIsLoading(false);
          return;
        }
        
        try {
          // Check if cabinet exists in the database for this user
          const { data: cabinetData, error } = await supabase
            .from('cabinets')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();
          
          if (error) {
            console.error("Error checking for cabinet:", error);
          }
          
          // Alternative check for team membership in case owner_id isn't set
          const { data: teamMemberData, error: teamError } = await supabase
            .from('team_members')
            .select('cabinet_id')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (teamError) {
            console.error("Error checking team membership:", teamError);
          }
          
          // If either cabinet exists or user is a team member
          if ((cabinetData && cabinetData.id) || (teamMemberData && teamMemberData.cabinet_id)) {
            // Cabinet exists, mark as configured and don't show dialog
            localStorage.setItem('profileConfigured', 'true');
            setShowCabinetProfile(false);
            console.log('Cabinet found in database, marking profile as configured');
          } else {
            // For first-time users: Check if this is their first login by looking for any team_member entry
            const { data: anyTeamMemberData, error: anyTeamError } = await supabase
              .from('team_members')
              .select('*')
              .eq('contact', session.user.email)
              .maybeSingle();
              
            if (anyTeamError) {
              console.error("Error checking team membership by email:", anyTeamError);
            }
            
            if (!anyTeamMemberData) {
              // No cabinet and not a team member - this is a new user who needs to create a cabinet
              console.log('New user detected, must create a cabinet');
              setShowCabinetProfile(true);
            } else {
              // User is a team member of an existing cabinet
              console.log('User is a team member but not cabinet owner');
              localStorage.setItem('profileConfigured', 'true');
              setShowCabinetProfile(false);
            }
          }
        } catch (dbError) {
          console.error("Database error when checking cabinet:", dbError);
          // If there's an exception querying the database, show the profile to ensure user can create a cabinet
          setShowCabinetProfile(true);
        }
        
        profileCheckComplete.current = true;
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking profile:", error);
        profileCheckComplete.current = true;
        setIsLoading(false);
        // Default to showing the profile on error to let the user set up their cabinet
        setShowCabinetProfile(true);
      }
    };
    
    // Small delay to avoid simultaneous checks
    const timer = setTimeout(() => {
      checkUserProfile();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [doctors]);

  return { isLoading, showCabinetProfile };
};
