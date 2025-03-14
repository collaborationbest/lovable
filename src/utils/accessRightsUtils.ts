
import { supabase } from "@/integrations/supabase/client";
import { PageAccessRights, MemberRole } from "@/types/TeamMember";

/**
 * Fetches access rights from Supabase database
 * @returns Promise<PageAccessRights[]> - The access rights
 */
export const fetchAccessRights = async (): Promise<PageAccessRights[]> => {
  try {
    const { data, error } = await supabase
      .from('access_rights')
      .select('*');
    
    if (error) {
      console.error("Error fetching access rights:", error);
      return [];
    }
    
    if (data && data.length > 0) {
      // Transform the data to the expected format and cast roles to MemberRole[]
      const formattedRights: PageAccessRights[] = data.map(item => ({
        pageId: item.page_id,
        pageName: item.page_id, // We don't have page names in the database
        roles: item.roles as MemberRole[]
      }));
      
      return formattedRights;
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchAccessRights:", error);
    return [];
  }
};

/**
 * Checks if a user has access to a specific page
 * @param pageId - The ID of the page
 * @param userEmail - The user's email
 * @param isAdmin - Whether the user is an admin
 * @param isAccountOwner - Whether the user is the account owner
 * @param userRole - The user's role
 * @param accessRights - The access rights for all pages
 * @param accountOwnerEmail - The account owner's email
 * @param cabinetEmail - The cabinet's email
 * @returns boolean - Whether the user has access
 */
export const checkPageAccess = (
  pageId: string,
  userEmail: string | null,
  isAdmin: boolean,
  isAccountOwner: boolean,
  userRole: string | null,
  accessRights: PageAccessRights[],
  accountOwnerEmail: string,
  cabinetEmail: string
): boolean => {
  // Account owner and cabinet email always have access to everything
  if (userEmail?.toLowerCase() === accountOwnerEmail.toLowerCase() || 
      userEmail?.toLowerCase() === cabinetEmail.toLowerCase()) {
    return true;
  }
  
  // Admins always have access
  if (isAdmin || isAccountOwner) return true;
  
  if (!userRole || !accessRights.length) return false;
  
  const pageAccess = accessRights.find(page => page.pageId === pageId);
  
  if (!pageAccess) return true;
  
  return pageAccess.roles.includes(userRole as MemberRole);
};
