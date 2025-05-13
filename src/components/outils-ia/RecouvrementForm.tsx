
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import FileUploadCamera from "@/components/outils-ia/FileUploadCamera";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/access-control";
import { useUserProfile } from "@/hooks/useUserProfile";
import FileList from "@/components/outils-ia/recouvrement/FileList";

const formSchema = z.object({
  patientFirstName: z.string().min(1, { message: "Le prénom est requis" }),
  patientLastName: z.string().min(1, { message: "Le nom est requis" }),
  patientEmail: z.string().email({ message: "Email invalide" }).optional().nullable(),
  patientPhone: z.string().optional().nullable(),
  patientAddress: z.string().optional().nullable(),
  amountDue: z.string().min(1, { message: "Le montant impayé est requis" }),
  description: z.string().max(500, { message: "Maximum 500 caractères" }).min(1, { message: "La description est requise" }),
});

type FormValues = z.infer<typeof formSchema>;

const RecouvrementForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [bucketExists, setBucketExists] = useState(false);
  const { userEmail, cabinetOwnerId, isAuthenticated } = useAccessControl();
  const { profile } = useUserProfile();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientFirstName: "",
      patientLastName: "",
      patientEmail: "",
      patientPhone: "",
      patientAddress: "",
      amountDue: "",
      description: "",
    },
  });

  useEffect(() => {
    const checkBucket = async () => {
      try {
        console.log("Checking recouvrement bucket...");
        const bucketResponse = await supabase.functions.invoke('create-recouvrement-bucket');
        console.log("Bucket check response:", bucketResponse);
        
        if (bucketResponse.error) {
          console.error("Error checking/creating bucket:", bucketResponse.error);
          toast.error("Erreur lors de la vérification du stockage");
          return;
        }
        
        setBucketExists(true);
      } catch (error) {
        console.error("Error checking bucket:", error);
      }
    };
    
    if (isAuthenticated) {
      checkBucket();
    }
  }, [isAuthenticated]);

  const handleFileSelect = (file: File) => {
    setSelectedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (!selectedFiles.length) return [];
    
    try {
      if (!bucketExists) {
        const bucketResponse = await supabase.functions.invoke('create-recouvrement-bucket');
        if (bucketResponse.error) {
          throw new Error("Impossible de créer le bucket de stockage");
        }
      }
      
      const fileUrls: string[] = [];
      console.log(`Uploading ${selectedFiles.length} files...`);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Veuillez vous connecter pour télécharger des fichiers");
        throw new Error("Authentication required for file upload");
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("Error verifying user auth:", userError);
        toast.error("Votre session a expiré, veuillez vous reconnecter");
        throw new Error("Authentication expired");
      }
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const filePath = `${timestamp}-${randomString}.${fileExt}`;
        
        console.log(`Uploading file: ${file.name} to path: ${filePath}`);
        
        let uploadError = null;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('recouvrement')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (uploadErr) {
              console.warn(`Upload attempt ${retryCount + 1} failed:`, uploadErr);
              uploadError = uploadErr;
              retryCount++;
              
              if (retryCount <= maxRetries) {
                console.log(`Retrying upload (${retryCount}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              
              break;
            } else {
              uploadError = null;
              
              const { data: urlData } = await supabase.storage
                .from('recouvrement')
                .getPublicUrl(filePath);
                
              if (urlData) {
                console.log("File uploaded, public URL:", urlData.publicUrl);
                fileUrls.push(urlData.publicUrl);
              }
              
              break;
            }
          } catch (e) {
            console.error("Unexpected error during upload:", e);
            uploadError = e;
            retryCount++;
            
            if (retryCount <= maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            break;
          }
        }
        
        if (uploadError) {
          console.error("Final upload error after retries:", uploadError);
          
          if (uploadError.message?.includes("permission") || uploadError.message?.includes("not authorized") || uploadError.statusCode === 403) {
            toast.error("Erreur de permission lors de l'upload. Veuillez vous reconnecter.");
            throw new Error(`Permission error during upload: ${uploadError.message}`);
          } else {
            toast.error(`Erreur lors de l'upload: ${file.name}`);
            continue;
          }
        }
      }
      
      return fileUrls;
    } catch (error) {
      console.error("Error in uploadFiles:", error);
      toast.error(typeof error === 'object' && error !== null ? 
        `Erreur lors de l'upload du fichier: ${JSON.stringify(error)}` : 
        "Erreur lors de l'upload des fichiers");
      throw error;
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour soumettre une demande de recouvrement");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting form submission with data:", JSON.stringify(data));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour soumettre une demande de recouvrement");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Starting recouvrement submission process...");
      
      if (!bucketExists) {
        const bucketResponse = await supabase.functions.invoke('create-recouvrement-bucket');
        console.log("Bucket response:", bucketResponse);
        
        if (bucketResponse.error) {
          console.error("Error checking/creating bucket:", bucketResponse.error);
          toast.error("Erreur lors de la vérification du stockage");
          setIsSubmitting(false);
          return;
        }
        
        setBucketExists(true);
      }
      
      let fileUrls: string[] = [];
      try {
        fileUrls = await uploadFiles();
        console.log("Files uploaded successfully:", fileUrls);
      } catch (error) {
        console.error("Error during file upload:", error);
        toast.error("Erreur lors de l'upload des fichiers. Réessayez ultérieurement.");
        setIsSubmitting(false);
        return;
      }
      
      let cabinetId = null;
      if (userEmail) {
        try {
          const { data: teamMemberData } = await supabase
            .from('team_members')
            .select('cabinet_id')
            .eq('contact', userEmail)
            .maybeSingle();
            
          if (teamMemberData && teamMemberData.cabinet_id) {
            cabinetId = teamMemberData.cabinet_id;
            console.log("Found cabinet ID:", cabinetId);
          }
        } catch (error) {
          console.error("Error fetching cabinet ID:", error);
        }
      }
      
      console.log("Saving recouvrement record to database...");
      try {
        const { data: recouvrementData, error: dbError } = await supabase
          .from('recouvrement_demandes')
          .insert({
            user_id: user.id,
            cabinet_id: cabinetId,
            patient_first_name: data.patientFirstName,
            patient_last_name: data.patientLastName,
            patient_email: data.patientEmail || null,
            patient_phone: data.patientPhone || null,
            patient_address: data.patientAddress || null,
            amount_due: data.amountDue,
            description: data.description,
            document_urls: fileUrls,
            status: 'pending'
          })
          .select();
          
        if (dbError) {
          console.error("Erreur lors de l'enregistrement de la demande:", dbError);
          toast.error("Erreur d'accès à la base de données: vos permissions semblent limitées pour cette opération. Veuillez rafraîchir la page ou vous reconnecter.");
          setIsSubmitting(false);
          return;
        }
        
        const submitterName = profile ? 
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
          user.user_metadata?.full_name || user.user_metadata?.name || '';
        
        const submitterEmail = profile?.email || user.email || userEmail || '';
        
        console.log("Preparing to send email notification...");
        console.log("Submitter name:", submitterName);
        console.log("Submitter email:", submitterEmail);
        
        const emailResponse = await supabase.functions.invoke('send-recouvrement-email', {
          body: {
            demande: {
              ...data,
              documentUrls: fileUrls,
              id: recouvrementData?.[0]?.id || null,
              submitterName,
              submitterEmail
            }
          }
        });
        
        console.log("Email function response:", emailResponse);
        
        if (emailResponse.error) {
          console.error("Erreur lors de l'envoi de l'email:", emailResponse.error);
          toast.error("La demande a été enregistrée mais l'email n'a pas pu être envoyé");
        } else {
          toast.success("Votre demande de recouvrement a été envoyée avec succès");
          form.reset();
          setSelectedFiles([]);
        }
      } catch (error) {
        console.error("Error saving recouvrement record:", error);
        toast.error("Erreur lors de l'enregistrement de la demande");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Une erreur est survenue lors de la soumission de votre demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="patientLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du patient</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="patientFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom du patient</FormLabel>
                  <FormControl>
                    <Input placeholder="Prénom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="patientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email du patient</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="patientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone du patient</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro de téléphone" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="patientAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse du patient</FormLabel>
                <FormControl>
                  <Input placeholder="Adresse complète" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amountDue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant impayé (€)</FormLabel>
                <FormControl>
                  <Input placeholder="Montant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description du problème</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Décrivez la situation (maximum 500 caractères)" 
                    className="resize-none h-[120px]" 
                    maxLength={500}
                    {...field} 
                  />
                </FormControl>
                <div className="flex justify-between items-center">
                  <FormMessage />
                  <span className="text-xs text-gray-500">{field.value.length}/500</span>
                </div>
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>Documents justificatifs (factures, chèques, etc.)</FormLabel>
            <FileUploadCamera 
              onFileSelect={handleFileSelect}
              acceptedTypes="image/*,application/pdf"
              label="Ajouter un document"
            />
            
            <FileList 
              files={selectedFiles} 
              onRemoveFile={handleRemoveFile} 
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#B88E23] hover:bg-[#8A6A1B]"
            disabled={isSubmitting || !isAuthenticated}
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer la demande de recouvrement"}
          </Button>
          
          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 mt-4">
              <p>Vous devez être connecté pour créer une demande de recouvrement. Veuillez vous connecter pour continuer.</p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default RecouvrementForm;
