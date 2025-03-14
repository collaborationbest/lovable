
import { supabase } from './client';
import { toast } from "@/components/ui/use-toast";
import { directDatabaseQuery } from './dbUtils';

/**
 * Retrieves a user profile by email
 * @param email The email to look up
 * @returns The profile data or null if not found
 */
export const getUserProfileByEmail = async (email: string) => {
  try {
    // Use case-insensitive search
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching profile by email:", error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error("Exception in getUserProfileByEmail:", e);
    return null;
  }
};

/**
 * Creates a user profile in the profiles table
 * @param userId The user's ID from auth.users
 * @param email The user's email
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @returns The created profile data or null if error
 */
export const createUserProfile = async (
  userId: string,
  email: string,
  firstName: string = '',
  lastName: string = ''
) => {
  try {
    // Convert email to lowercase for better matching
    const normalizedEmail = email.toLowerCase();
    
    // Check if profile already exists (case-insensitive check)
    const existingProfile = await getUserProfileByEmail(normalizedEmail);
    
    if (existingProfile) {
      console.log("Profile already exists for this email:", normalizedEmail);
      return existingProfile;
    }
    
    // Try direct insertion first
    const profileData = {
      id: userId,
      email: normalizedEmail,
      first_name: firstName,
      last_name: lastName,
    };
    
    // Try direct insertion to bypass any triggers/RLS
    const { data, error } = await directDatabaseQuery('profiles', 'insert', {
      data: profileData,
      returning: true
    });
    
    if (error) {
      console.error("Error creating profile with direct query:", error);
      
      // If it's a unique constraint violation, handle it gracefully
      if (error.code === '23505') {
        console.log("Email uniqueness violation detected");
        
        // Try to find the existing profile again with exact match
        const { data: existingData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();
          
        if (existingData) {
          console.log("Found existing profile with exact email match:", existingData);
          return existingData;
        }
      }
      
      // Fall back to standard insert
      const { data: standardData, error: standardError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();
      
      if (standardError) {
        console.error("Error creating profile with standard query:", standardError);
        
        // As a last resort, try to find if the profile was actually created despite the error
        const { data: existingData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (existingData) {
          console.log("Profile exists despite error:", existingData);
          return existingData;
        }
        
        return null;
      }
      
      return standardData;
    }
    
    return data;
  } catch (e) {
    console.error("Exception in createUserProfile:", e);
    return null;
  }
};
