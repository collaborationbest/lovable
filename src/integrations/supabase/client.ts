
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { ensureUserCabinetAssociation } from './cabinetUtils';

const SUPABASE_URL = "https://jhfvlccefrzuojvaoilz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZnZsY2NlZnJ6dW9qdmFvaWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MDY3NzcsImV4cCI6MjA1NjE4Mjc3N30.3PnGkLaonvbP7VvGbxIxxPxo0ztoAg9uPk23trH2PYs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export { ensureUserCabinetAssociation };
