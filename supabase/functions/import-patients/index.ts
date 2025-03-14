
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as csv from "https://deno.land/std@0.168.0/encoding/csv.ts";
import * as xlsx from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fieldMappings = {
  // Standard column names in our expected format
  id: "id",
  import_identifier: "import_identifier",
  gender: "gender",
  last_name: "last_name",
  maiden_name: "maiden_name", 
  first_name: "first_name",
  birthdate: "birthdate",
  email: "email",
  phone_number: "phone_number",
  secondary_phone_number: "secondary_phone_number",
  address: "address",
  zipcode: "zipcode",
  city: "city",
  
  // Legacy mappings
  nom: "last_name",
  prenom: "first_name",
  dateNaissance: "birthdate",
  telephone: "phone_number",
  adresse: "address",
  ville: "city",
  codePostal: "zipcode"
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer le fichier depuis la requête
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Aucun fichier valide reçu" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Créer le client Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    console.log("File extension:", fileExtension);
    
    // Traiter le fichier selon son format
    let patients = [];
    if (fileExtension === "csv") {
      // Traiter le fichier CSV
      const text = await file.text();
      console.log("CSV text sample:", text.substring(0, 200));
      
      try {
        // Parse CSV with more options for compatibility
        const rawParsed = await csv.parse(text);
        
        if (rawParsed.length <= 1) {
          throw new Error("Le fichier CSV ne contient pas suffisamment de données");
        }
        
        // Get headers from first row
        const headers = rawParsed[0];
        console.log("Detected headers:", headers);
        
        // Map the data
        patients = rawParsed.slice(1).map(row => {
          const patient = {};
          
          // Match each header to our known fields
          headers.forEach((header, index) => {
            const cleanHeader = header.toLowerCase().trim();
            
            // Try to map this header to our expected field names
            for (const [expectedField, mappedField] of Object.entries(fieldMappings)) {
              if (cleanHeader === expectedField || 
                  cleanHeader.includes(expectedField) ||
                  // Special cases for fuzzy matching
                  (expectedField === "last_name" && (cleanHeader.includes("nom") && !cleanHeader.includes("prenom"))) ||
                  (expectedField === "first_name" && (cleanHeader.includes("prenom") || cleanHeader.includes("prénom"))) ||
                  (expectedField === "phone_number" && (cleanHeader.includes("tel") || cleanHeader.includes("phone"))) ||
                  (expectedField === "birthdate" && (cleanHeader.includes("naissance") || cleanHeader.includes("birth"))) ||
                  (expectedField === "address" && (cleanHeader.includes("adresse") || cleanHeader.includes("address"))) ||
                  (expectedField === "city" && (cleanHeader.includes("ville") || cleanHeader.includes("city"))) ||
                  (expectedField === "zipcode" && (cleanHeader.includes("postal") || cleanHeader.includes("zip"))) ||
                  (expectedField === "email" && cleanHeader.includes("mail")) ||
                  (expectedField === "maiden_name" && (cleanHeader.includes("jeune") || cleanHeader.includes("maiden"))) ||
                  (expectedField === "gender" && (cleanHeader.includes("sexe") || cleanHeader.includes("genre")))
              ) {
                patient[mappedField] = row[index] || '';
                break; // Once we've mapped this header, move to the next
              }
            }
          });
          
          return patient;
        });
      } catch (e) {
        console.error("CSV parsing failed:", e);
        throw new Error("Impossible de parser le fichier CSV. Format non supporté.");
      }
    } else if (fileExtension === "xlsx") {
      // Traiter le fichier XLSX
      try {
        const arrayBuffer = await file.arrayBuffer();
        console.log("Got XLSX buffer with size:", arrayBuffer.byteLength);
        
        if (arrayBuffer.byteLength === 0) {
          throw new Error("Le fichier XLSX est vide");
        }
        
        // Parse XLSX file with explicit format
        const workbook = xlsx.read(new Uint8Array(arrayBuffer), { type: "array" });
        console.log("XLSX workbook loaded. Sheets:", workbook.SheetNames);
        
        if (!workbook.SheetNames.length) {
          throw new Error("Le fichier XLSX ne contient aucune feuille");
        }
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
          throw new Error("Feuille de calcul non trouvée");
        }
        
        // Convert to JSON with headers
        const options = { header: 1, defval: "", blankrows: false };
        const rawData = xlsx.utils.sheet_to_json(worksheet, options);
        console.log("XLSX raw data sample (first 2 rows):", rawData.slice(0, 2));
        
        if (!rawData.length || rawData.length <= 1) {
          throw new Error("Le fichier XLSX ne contient pas suffisamment de données");
        }
        
        // Get headers from first row
        const headers = rawData[0].map(h => h !== null && h !== undefined ? String(h).trim() : "");
        console.log("XLSX headers:", headers);
        
        // Map the data (rows after header)
        patients = rawData.slice(1).map(row => {
          const patient = {};
          
          // Match each header to our known fields
          headers.forEach((header, index) => {
            if (index < row.length) {
              const cellValue = row[index];
              if (cellValue === undefined || cellValue === null) return;
              
              const cleanHeader = String(header).toLowerCase().trim();
              
              // Try to map this header to our expected field names
              for (const [expectedField, mappedField] of Object.entries(fieldMappings)) {
                if (cleanHeader === expectedField || 
                    cleanHeader.includes(expectedField) ||
                    // Special cases for fuzzy matching
                    (expectedField === "last_name" && (cleanHeader.includes("nom") && !cleanHeader.includes("prenom"))) ||
                    (expectedField === "first_name" && (cleanHeader.includes("prenom") || cleanHeader.includes("prénom"))) ||
                    (expectedField === "phone_number" && (cleanHeader.includes("tel") || cleanHeader.includes("phone"))) ||
                    (expectedField === "birthdate" && (cleanHeader.includes("naissance") || cleanHeader.includes("birth"))) ||
                    (expectedField === "address" && (cleanHeader.includes("adresse") || cleanHeader.includes("address"))) ||
                    (expectedField === "city" && (cleanHeader.includes("ville") || cleanHeader.includes("city"))) ||
                    (expectedField === "zipcode" && (cleanHeader.includes("postal") || cleanHeader.includes("zip"))) ||
                    (expectedField === "email" && cleanHeader.includes("mail")) ||
                    (expectedField === "maiden_name" && (cleanHeader.includes("jeune") || cleanHeader.includes("maiden"))) ||
                    (expectedField === "gender" && (cleanHeader.includes("sexe") || cleanHeader.includes("genre")))
                ) {
                  patient[mappedField] = String(cellValue);
                  break; // Once we've mapped this header, move to the next
                }
              }
            }
          });
          
          return patient;
        });
      } catch (e) {
        console.error("XLSX parsing failed:", e);
        throw new Error(`Impossible de parser le fichier XLSX: ${e.message}`);
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Format de fichier non supporté. Utilisez CSV ou XLSX." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Parsed ${patients.length} patients for import`);

    // Préparer les données pour l'insertion
    const patientsToInsert = patients.map((patient) => ({
      id: patient.id || crypto.randomUUID(),
      import_identifier: patient.import_identifier || null,
      nom: patient.last_name || "Inconnu",
      prenom: patient.first_name || "",
      email: patient.email || null,
      telephone: patient.phone_number || null,
      datenaissance: patient.birthdate || null,
      adresse: patient.address || null,
      ville: patient.city || null,
      codepostal: patient.zipcode || null,
      gender: patient.gender || null,
      maiden_name: patient.maiden_name || null,
      secondary_phone_number: patient.secondary_phone_number || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insérer les patients en base de données
    const { data, error } = await supabaseClient
      .from("patients")
      .insert(patientsToInsert);

    if (error) {
      console.error("Error inserting patients:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'insertion des patients", details: error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, count: patientsToInsert.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erreur d'importation:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors du traitement du fichier", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
