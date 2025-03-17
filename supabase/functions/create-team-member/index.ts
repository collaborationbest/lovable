
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from './config.ts'
import { handleTeamMemberCreation } from './handlers.ts'

console.log("Loading create-team-member function...");

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("================ CREATE TEAM MEMBER FUNCTION ================");
    console.log("Request received:", req.method);
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    );
    
    // Parse the request body
    const requestData = await req.json();
    console.log("Request data type:", typeof requestData);
    console.log("Request data keys:", Object.keys(requestData));
    
    // Check for cabinet creation action
    if (requestData.action === 'create_cabinet') {
      console.log("Cabinet creation request detected");
      
      const { cabinetName, city, openingDate, ownerId } = requestData;
      
      if (!ownerId) {
        throw new Error("Missing owner ID for cabinet creation");
      }
      
      const cabinetId = `cab_${Date.now().toString(36)}`;
      
      const { data: cabinetData, error: cabinetError } = await supabaseClient
        .from('cabinets')
        .insert({
          id: cabinetId,
          name: cabinetName || 'Mon Cabinet Dentaire',
          city: city || '',
          opening_date: openingDate || null,
          owner_id: ownerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active'
        })
        .select();
      
      if (cabinetError) {
        throw cabinetError;
      }
      
      console.log("Cabinet created successfully:", cabinetData);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Cabinet created successfully",
          data: cabinetData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle team member creation (existing code)
    const result = await handleTeamMemberCreation(supabaseClient, requestData, req.headers);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in create-team-member function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unknown error occurred",
        error: String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
