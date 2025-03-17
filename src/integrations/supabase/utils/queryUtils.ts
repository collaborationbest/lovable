
import { supabase } from '../client';
import { generateUUID } from './uuidUtils';
import { DatabaseOperation, QueryResult } from './dbTypes';

// Cache for direct database queries
const queryCache = new Map<string, {
  data: any, 
  timestamp: number,
  expirationTime: number
}>();

// Default cache expiration time - 5 minutes
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Generate a cache key for a query
 */
const generateCacheKey = (
  tableName: string, 
  operation: DatabaseOperation,
  queryData: any
): string => {
  return `${tableName}:${operation}:${JSON.stringify(queryData)}`;
};

/**
 * Check if a cached result is still valid
 */
const isCacheValid = (cacheKey: string): boolean => {
  const cachedItem = queryCache.get(cacheKey);
  if (!cachedItem) return false;
  
  const now = Date.now();
  return now - cachedItem.timestamp < cachedItem.expirationTime;
};

/**
 * Cache a query result
 */
const cacheQueryResult = (
  cacheKey: string, 
  data: any, 
  expirationTime: number = DEFAULT_CACHE_EXPIRATION
): void => {
  queryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    expirationTime
  });
};

/**
 * Invalidate specific cache entries by prefix
 */
export const invalidateQueryCache = (tableName: string, operation?: DatabaseOperation): void => {
  const prefix = operation ? `${tableName}:${operation}` : tableName;
  
  // Remove all cache entries that match the prefix
  queryCache.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      queryCache.delete(key);
    }
  });
};

/**
 * Direct database access method that bypasses RLS for essential operations
 * This helps avoid infinite recursion issues
 */
export const directDatabaseQuery = async <T>(
  tableName: string, 
  operation: DatabaseOperation,
  queryData: any,
  options: {
    useCache?: boolean,
    cacheExpirationTime?: number
  } = {}
): Promise<QueryResult<T>> => {
  const { useCache = true, cacheExpirationTime = DEFAULT_CACHE_EXPIRATION } = options;
  
  // For SELECT operations, check cache if enabled
  if (useCache && operation === 'select') {
    const cacheKey = generateCacheKey(tableName, operation, queryData);
    
    if (isCacheValid(cacheKey)) {
      return queryCache.get(cacheKey)!.data;
    }
  }
  
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
        
        // Invalidate SELECT caches for this table after modification
        invalidateQueryCache(tableName, 'select');
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
        
        // Invalidate SELECT caches for this table after modification
        invalidateQueryCache(tableName, 'select');
        break;
        
      case 'delete':
        // Use type assertion to handle dynamic table names
        result = await supabase.from(tableName as any).delete();
        if (queryData.filters) {
          for (const [key, value] of Object.entries(queryData.filters)) {
            result = result.eq(key, value);
          }
        }
        
        // Invalidate SELECT caches for this table after modification
        invalidateQueryCache(tableName, 'select');
        break;
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    // Cache SELECT results if caching is enabled
    if (useCache && operation === 'select') {
      const cacheKey = generateCacheKey(tableName, operation, queryData);
      cacheQueryResult(cacheKey, result, cacheExpirationTime);
    }
    
    return result;
  } catch (error) {
    console.error(`Error in directDatabaseQuery for ${operation} on ${tableName}:`, error);
    return { data: null, error };
  }
};
