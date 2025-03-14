
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Pour cette démo, on accepte n'importe quelle adresse email se terminant par @doctolib.fr
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email et mot de passe requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Vérification simple pour la démo : l'email doit se terminer par @doctolib.fr
    if (!email.endsWith('@doctolib.fr')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Identifiants Doctolib invalides' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Enregistrer la connexion dans la base de données
    const { error } = await supabaseClient
      .from('doctolib_config')
      .upsert({
        id: 1,
        connected: true, 
        email: email,
        last_sync: new Date().toISOString()
      })
    
    if (error) {
      console.error('Erreur lors de l\'enregistrement de la connexion Doctolib:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Erreur lors de l\'enregistrement de la connexion' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Connecté à Doctolib Pro' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Une erreur est survenue' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
