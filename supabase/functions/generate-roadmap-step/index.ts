
// Importing required modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Serve HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse the request body
    const { existingItems, userMessage } = await req.json();
    
    // Create a Supabase client with Deno API
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Obtenez le message de l'utilisateur ou utilisez un message par défaut
    const prompt = userMessage || "Suggérez une nouvelle étape pour ma feuille de route de création de cabinet dentaire";
    
    // Préparez le contexte pour le modèle
    const context = {
      existingItems: existingItems.map(item => ({
        title: item.title,
        description: item.description,
        steps: item.steps
      }))
    };

    // Convertir le contexte en texte pour l'inclure dans le prompt
    const contextText = JSON.stringify(context, null, 2);
    
    // Appeler l'API OpenAI via la fonction Edge
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant spécialisé dans la création de feuilles de route pour l'installation de cabinets dentaires.
            Ton objectif est d'analyser les étapes existantes et de proposer une nouvelle étape complémentaire et cohérente.
            Chaque étape comprend un titre, une description concise, et une liste de 5 sous-étapes pratiques.
            Réponds de manière conversationnelle à l'utilisateur tout en générant une nouvelle étape au format JSON.
            La nouvelle étape doit être différente des étapes existantes et apporter une réelle valeur ajoutée.
            Voici le format de réponse attendu:
            {
              "message": "Ta réponse conversationnelle à l'utilisateur...",
              "item": {
                "title": "Titre de l'étape avec une emoji 📋",
                "description": "Description concise de l'étape",
                "steps": ["Sous-étape 1", "Sous-étape 2", "Sous-étape 3", "Sous-étape 4", "Sous-étape 5"]
              }
            }
            IMPORTANT: Inclus toujours une emoji pertinente dans le titre de l'étape.`
          },
          {
            role: "user",
            content: `Voici mes étapes existantes dans ma feuille de route d'installation de cabinet dentaire:
            
            ${contextText}
            
            Requête de l'utilisateur: "${prompt}"
            
            Génère une nouvelle étape pertinente qui n'existe pas déjà dans la liste, avec une réponse conversationnelle.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Pas de réponse de l'API");
    }
    
    // Parse la réponse 
    const assistantResponse = data.choices[0].message.content;
    let parsedResponse;
    
    try {
      // Essayer d'extraire et de parser le JSON de la réponse
      const jsonMatch = assistantResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Format de réponse invalide");
      }
    } catch (error) {
      console.error("Erreur lors du parsing de la réponse:", error);
      // Fallback avec une réponse générique
      parsedResponse = {
        message: "J'ai créé une nouvelle étape pour votre feuille de route.",
        item: {
          title: "Nouvelle étape 📋",
          description: "Une étape supplémentaire pour votre feuille de route",
          steps: [
            "Première action à réaliser",
            "Deuxième action à réaliser",
            "Troisième action à réaliser",
            "Quatrième action à réaliser",
            "Cinquième action à réaliser"
          ]
        }
      };
    }
    
    // Return the processed data with CORS headers
    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      },
    );
  } catch (error) {
    // Handle errors
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      },
    );
  }
});
