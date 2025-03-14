
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile, updateUserProfile } from '@/integrations/supabase/userProfile';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  role: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch the user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getCurrentUserProfile();
      setProfile(profileData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Update the user profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const success = await updateUserProfile(profileData);
      
      if (success) {
        // Refresh the profile data
        await fetchUserProfile();
        return true;
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUserProfile();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchUserProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchUserProfile
  };
}
