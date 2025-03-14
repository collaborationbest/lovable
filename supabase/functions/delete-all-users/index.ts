
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

// Configure CORS pour permettre les requêtes depuis le frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Créer un client Supabase avec le rôle de service pour pouvoir supprimer des utilisateurs
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Vérifier que la requête est de type POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Méthode non autorisée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      )
    }
    
    // Extraire les données de la requête
    const { adminEmail } = await req.json()
    
    if (!adminEmail) {
      return new Response(
        JSON.stringify({ success: false, message: 'Paramètres manquants' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Vérifier l'authentification du JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Non autorisé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Non autorisé', error: authError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Vérifier que l'utilisateur est bien le propriétaire du compte
    if (user.email !== adminEmail) {
      return new Response(
        JSON.stringify({ success: false, message: 'Vous n\'êtes pas autorisé à effectuer cette opération' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    // Récupérer tous les utilisateurs sauf l'administrateur
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Erreur lors de la récupération des utilisateurs', error: usersError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Filtrer la liste pour exclure l'admin
    const usersToDelete = users.users.filter(u => u.email !== adminEmail)
    console.log(`Nombre d'utilisateurs à supprimer: ${usersToDelete.length}`)
    
    // Supprimer les données des tables associées aux utilisateurs
    const tables = ['team_members', 'cabinets', 'profiles', 'documents', 'folders', 'patients', 'tasks', 'events']
    const deletePromises = []
    
    // Nettoyer les tables pour tous les utilisateurs sauf l'administrateur
    for (const table of tables) {
      try {
        console.log(`Suppression des données de la table ${table}...`)
        
        // Pour les tables avec une colonne user_id qui fait référence à auth.users
        if (['profiles', 'tasks', 'events'].includes(table)) {
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .neq('user_id', user.id)
          
          if (error) {
            console.error(`Erreur lors de la suppression des données de ${table}:`, error)
          }
        } 
        // Pour team_members avec contact
        else if (table === 'team_members') {
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .neq('contact', adminEmail)
          
          if (error) {
            console.error(`Erreur lors de la suppression des données de ${table}:`, error)
          }
        }
        // Pour les autres tables
        else {
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .not('id', 'is', null)
          
          if (error) {
            console.error(`Erreur lors de la suppression des données de ${table}:`, error)
          }
        }
      } catch (error) {
        console.error(`Erreur critique lors de la suppression des données de ${table}:`, error)
      }
    }
    
    // Supprimer les utilisateurs sauf l'administrateur
    let deletedCount = 0
    for (const userToDelete of usersToDelete) {
      try {
        if (userToDelete.email !== adminEmail) {
          console.log(`Suppression de l'utilisateur ${userToDelete.email}...`)
          const { error } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id)
          
          if (error) {
            console.error(`Erreur lors de la suppression de l'utilisateur ${userToDelete.email}:`, error)
          } else {
            deletedCount++
          }
        }
      } catch (error) {
        console.error(`Erreur critique lors de la suppression de l'utilisateur ${userToDelete.email}:`, error)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${deletedCount} utilisateurs ont été supprimés avec succès`,
        deletedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Erreur critique:', error)
    
    return new Response(
      JSON.stringify({ success: false, message: 'Une erreur est survenue', error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
