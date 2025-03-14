
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Données de démonstration pour simuler des patients Doctolib
const mockPatients = [
  {
    id: "doc-123456",
    nom: "Martin",
    prenom: "Sophie",
    email: "sophie.martin@example.com",
    telephone: "0612345678",
    dateNaissance: "1985-05-15",
    adresse: "123 Rue de Paris",
    ville: "Lyon",
    codePostal: "69000",
    lastAppointment: "2023-11-10T10:00:00+01:00",
    nextAppointment: "2023-12-20T11:30:00+01:00"
  },
  {
    id: "doc-234567",
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@example.com",
    telephone: "0723456789",
    dateNaissance: "1972-08-22",
    adresse: "45 Avenue Victor Hugo",
    ville: "Paris",
    codePostal: "75016",
    lastAppointment: "2023-11-05T14:00:00+01:00",
    nextAppointment: null
  },
  {
    id: "doc-345678",
    nom: "Dubois",
    prenom: "Marie",
    email: "marie.dubois@example.com",
    telephone: "0634567890",
    dateNaissance: "1990-03-10",
    adresse: "8 Boulevard des Fleurs",
    ville: "Marseille",
    codePostal: "13000",
    lastAppointment: null,
    nextAppointment: "2023-12-05T09:15:00+01:00"
  },
  {
    id: "doc-456789",
    nom: "Petit",
    prenom: "Thomas",
    email: "thomas.petit@example.com",
    telephone: "0745678901",
    dateNaissance: "1988-12-25",
    adresse: "17 Rue du Commerce",
    ville: "Bordeaux",
    codePostal: "33000"
  },
  {
    id: "doc-567890",
    nom: "Leroy",
    prenom: "Emilie",
    email: "emilie.leroy@example.com",
    telephone: "0656789012",
    dateNaissance: "1995-07-30",
    adresse: "29 Rue des Lilas",
    ville: "Lille",
    codePostal: "59000",
    lastAppointment: "2023-10-20T16:30:00+02:00",
    nextAppointment: "2023-12-15T15:45:00+01:00"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Pour la démo, on utilise toujours des données fictives
    const patients = mockPatients;
    
    // Insérer les patients dans la base de données
    const { error: upsertError } = await supabaseClient
      .from('patients')
      .upsert(patients, { onConflict: 'id' })
    
    if (upsertError) {
      console.error('Erreur lors de la synchronisation des patients:', upsertError)
      return new Response(
        JSON.stringify({ success: false, message: 'Erreur lors de la synchronisation des patients' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Simuler la connexion à Doctolib
    await supabaseClient
      .from('doctolib_config')
      .upsert({ id: 1, connected: true, last_sync: new Date().toISOString() })
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Synchronisation réussie', 
        count: patients.length 
      }),
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
