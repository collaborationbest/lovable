
import { supabase } from './client';

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

/**
 * Get the current user's profile
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Exception in getCurrentUserProfile:", error);
    return null;
  }
};

/**
 * Update the current user's profile
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Remove id from profileData if it exists
    const { id, ...updateData } = profileData;
    
    // Add updated_at timestamp
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    // Make sure email is included if required
    if (!dataToUpdate.email && user.email) {
      dataToUpdate.email = user.email;
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .update(dataToUpdate)
      .eq('id', user.id);
    
    if (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in updateUserProfile:", error);
    return false;
  }
};

/**
 * Get a user profile by ID
 */
export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile by ID:", error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Exception in getUserProfileById:", error);
    return null;
  }
};

/**
 * Ensure a user profile exists or create it
 */
export const ensureUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    const timestamp = new Date().toISOString();
    
    if (existingProfile) {
      // Update existing profile with email
      const updateData = {
        ...profileData,
        email: profileData.email || existingProfile.email, // Ensure email is included
        updated_at: timestamp
      };
      
      // Make sure email is always present (required by the database)
      if (!updateData.email) {
        const { data } = await supabase.auth.getUser(userId);
        updateData.email = data?.user?.email || '';
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (error) {
        console.error("Error updating user profile:", error);
        return false;
      }
    } else {
      // Try to get user email from auth
      let email = profileData.email;
      if (!email) {
        const { data } = await supabase.auth.getUser(userId);
        email = data?.user?.email;
      }

      if (!email) {
        console.error("Cannot create user profile without email");
        return false;
      }

      // Create new profile with required email field
      const insertData = {
        id: userId,
        ...profileData,
        email: email,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const { error } = await supabase
        .from('user_profiles')
        .insert(insertData);
      
      if (error) {
        console.error("Error creating user profile:", error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Exception in ensureUserProfile:", error);
    return false;
  }
};
