
import { supabase } from './client';
import { directDatabaseQuery } from './dbUtils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new cabinet (dental office) for a user
 * @param userId The user's ID who will be the owner
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @returns The created cabinet data or null if error
 */
export const createUserCabinet = async (
  userId: string, 
  firstName: string = '',
  lastName: string = ''
) => {
  try {
    // Generate cabinet name based on user's name if available
    const cabinetName = firstName || lastName 
      ? `Cabinet du Dr. ${firstName} ${lastName}`.trim() 
      : `Cabinet Dentaire`;
    
    // Check if cabinet already exists for this user
    const { data: existingCabinet } = await supabase
      .from('cabinets')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (existingCabinet) {
      console.log("Cabinet already exists for this user:", existingCabinet);
      return existingCabinet;
    }
    
    const cabinetData = {
      id: uuidv4(), // Explicitly generate UUID for the cabinet
      name: cabinetName,
      owner_id: userId,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    console.log("Creating cabinet with data:", cabinetData);
    
    // Try direct insertion to bypass any triggers/RLS
    const { data, error } = await directDatabaseQuery('cabinets', 'insert', {
      data: cabinetData,
      returning: true
    });
    
    if (error) {
      console.error("Error creating cabinet with direct query:", error);
      
      // Fall back to standard insert
      const { data: standardData, error: standardError } = await supabase
        .from('cabinets')
        .insert(cabinetData)
        .select();
      
      if (standardError) {
        console.error("Error creating cabinet with standard query:", standardError);
        return null;
      }
      
      console.log("Cabinet created successfully with standard query:", standardData);
      return standardData;
    }
    
    console.log("Cabinet created successfully with direct query:", data);
    return data;
  } catch (e) {
    console.error("Exception in createUserCabinet:", e);
    return null;
  }
};
