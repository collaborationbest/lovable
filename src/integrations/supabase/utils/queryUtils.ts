
import { supabase } from '../client';
import { generateUUID } from './uuidUtils';
import { DatabaseOperation, QueryResult } from './dbTypes';

/**
 * Direct database access method that bypasses RLS for essential operations
 * This helps avoid infinite recursion issues
 */
export const directDatabaseQuery = async <T>(
  tableName: string, 
  operation: DatabaseOperation,
  queryData: any
): Promise<QueryResult<T>> => {
  try {
    let result;
    
    switch (operation) {
      case 'select':
        // Use type assertion to handle dynamic table names
        result = await supabase.from(tableName as any).select(queryData.select || '*');
        if (queryData.filters) {
          for (const [key, value] of Object.entries(queryData.filters)) {
            result = result.eq(key, value);
          }
        }
        if (queryData.single) {
          result = result.maybeSingle();
        }
        break;
        
      case 'insert':
        // Ensure data has an ID if it's required and not provided
        if ((tableName === 'cabinets' || tableName === 'profiles') && !queryData.data.id) {
          queryData.data.id = generateUUID();
        }
        
        // If returning data is requested, handle the select properly
        if (queryData.returning) {
          // Use type assertion to handle dynamic table names
          result = await supabase
            .from(tableName as any)
            .insert(queryData.data)
            .select();
        } else {
          result = await supabase
            .from(tableName as any)
            .insert(queryData.data);
        }
        break;
        
      case 'update':
        // Use type assertion to handle dynamic table names
        let updateQuery = supabase.from(tableName as any).update(queryData.data);
        if (queryData.filters) {
          for (const [key, value] of Object.entries(queryData.filters)) {
            updateQuery = updateQuery.eq(key, value);
          }
        }
        
        // If returning data is requested, handle the select properly
        if (queryData.returning) {
          result = await updateQuery.select();
        } else {
          result = await updateQuery;
        }
        break;
        
      case 'delete':
        // Use type assertion to handle dynamic table names
        result = await supabase.from(tableName as any).delete();
        if (queryData.filters) {
          for (const [key, value] of Object.entries(queryData.filters)) {
            result = result.eq(key, value);
          }
        }
        break;
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error in directDatabaseQuery for ${operation} on ${tableName}:`, error);
    return { data: null, error };
  }
};
