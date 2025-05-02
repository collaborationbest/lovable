
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../create-team-member/config.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequestBody {
  email: string;
  firstName?: string;
  lastName?: string;
  temporaryPassword: string;
  loginUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    console.log("================ SEND WELCOME EMAIL FUNCTION ================");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const resendApiKey = RESEND_API_KEY;
    
    console.log("Environment variables available:");
    console.log("- SUPABASE_URL:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceRoleKey);
    console.log("- SUPABASE_ANON_KEY:", !!supabaseAnonKey);
    console.log("- RESEND_API_KEY:", !!resendApiKey);
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    )
    
    // Parse request body
    let requestBody: EmailRequestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", {
        email: requestBody.email,
        firstName: requestBody.firstName,
        lastName: requestBody.lastName,
        loginUrl: requestBody.loginUrl,
        passwordProvided: !!requestBody.temporaryPassword
      });
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid JSON in request body");
    }
    
    const { email, firstName, lastName, temporaryPassword, loginUrl } = requestBody;
    
    if (!email || !temporaryPassword || !loginUrl) {
      throw new Error("Missing required fields in request body");
    }
    
    // Ensure we have valid first/last names
    const safeFirstName = firstName || email.split('@')[0];
    const safeLastName = lastName || '';
    
    // Send welcome email directly without trying to create/verify user
    // This function should only focus on sending the email with the credentials provided
    
    console.log("Sending welcome email...");
    const resendEndpoint = "https://api.resend.com/emails";
    
    // Update the URL to the new preview URL
    const currentPreviewUrl = "https://preview-ac299eea--dentalpilote-4b097d7a.lovable.app";
    
    // If loginUrl contains the old preview URL, replace it with the new one
    const updatedLoginUrl = loginUrl.includes("preview--dentalpilote.lovable.app") 
      ? currentPreviewUrl + "/auth" 
      : loginUrl;
    
    const emailResponse = await fetch(resendEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'DentalPilote <no-reply@dentalpilote.com>',
        to: email,
        subject: 'Bienvenue sur DentalPilote - Votre nouvel accès',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <img src="https://dentalpilote.com/logo.png" alt="DentalPilote Logo" style="display: block; margin: 0 auto; max-width: 200px;">
            <h2 style="color: #4D74CB; text-align: center;">Bienvenue sur DentalPilote!</h2>
            <p>Bonjour ${safeFirstName} ${safeLastName},</p>
            <p>Vous avez été invité(e) à rejoindre DentalPilote. Voici vos identifiants de connexion :</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Mot de passe temporaire :</strong> ${temporaryPassword}</p>
              <p><em>Nous vous recommandons de changer votre mot de passe après votre première connexion.</em></p>
            </div>
            <p style="text-align: center;">
              <a href="${updatedLoginUrl}" style="display: inline-block; background-color: #4D74CB; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                Se connecter maintenant
              </a>
            </p>
            <p>Si vous avez des questions, n'hésitez pas à contacter l'administrateur de votre cabinet.</p>
            <p>Cordialement,<br>L'équipe DentalPilote</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666; font-size: 12px;">
              <p>Ce message est automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        `
      })
    });
    
    const emailResult = await emailResponse.json();
    console.log("Email API response:", emailResult);
    
    if (!emailResponse.ok) {
      console.error("Error sending email through Resend API:", emailResult);
      throw new Error(`Failed to send email: ${JSON.stringify(emailResult)}`);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        emailSent: true,
        message: "Welcome email sent successfully",
        debug: {
          emailId: emailResult.id
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
        debug: {
          stack: error.stack,
          name: error.name
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
