import React, { useState } from "react";
import OutilIALayout from "@/components/outils-ia/OutilIALayout";
import { CreditCard, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequiredDocumentsList from "@/components/documents/RequiredDocumentsList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/components/documents/types";
import { getFileIcon, requiredDocumentsList } from "@/components/documents/DocumentsUtils";

const Financement = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("simulation");
  const { toast } = useToast();

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>, documentType?: string) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    try {
      setUploadLoading(true);
      
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Types de fichiers non pris en charge",
          description: "Seuls les fichiers PDF, PNG et JPG sont acceptés.",
          variant: "destructive",
        });
        return;
      }
      
      const uploadedDocuments: Document[] = [];
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
          
        const publicUrl = publicUrlData.publicUrl;
        
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            name: file.name,
            file_type: file.type,
            size: file.size,
            url: publicUrl,
            folder_id: null,
            document_type: documentType
          })
          .select();
          
        if (docError) {
          throw docError;
        }
        
        if (docData && docData.length > 0) {
          uploadedDocuments.push(docData[0]);
        }
      }
      
      setDocuments([...documents, ...uploadedDocuments]);
      
      toast({
        title: "Fichiers téléchargés",
        description: `${uploadedDocuments.length} fichier(s) téléchargé(s) avec succès.`
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement des fichiers:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger les fichiers. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteItem = async (id: string, type: 'folder' | 'document', name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    try {
      if (type === 'document') {
        const { data: docData, error: fetchError } = await supabase
          .from('documents')
          .select('url')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        
        if (docData && docData.url) {
          const filePath = docData.url.split('/').pop();
          
          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from('documents')
              .remove([filePath]);
            
            if (storageError) throw storageError;
          }
        }
        
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setDocuments(documents.filter(doc => doc.id !== id));
      }
      
      toast({
        title: "Supprimé",
        description: `"${name}" a été supprimé.`
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .not('document_type', 'is', null);
          
        if (error) throw error;
        
        setDocuments(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des documents:", error);
      }
    };
    
    fetchDocuments();
  }, []);

  return (
    <OutilIALayout
      title="Financer le Projet"
      icon={<CreditCard size={36} />}
      description="Optimisez votre financement et maximisez vos chances d'obtenir un prêt avantageux."
    >
      <Tabs defaultValue="simulation" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 md:mb-6 w-full">
          <TabsTrigger value="simulation" className="flex items-center flex-1">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Simulation</span>
            <span className="sm:hidden">Simul.</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center flex-1">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Documents à fournir</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="mt-0">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-medium text-[#5C4E3D] mb-4">Simulateur de financement IA</h3>
            <p className="text-amber-600 text-sm md:text-base">
              Cette fonctionnalité sera disponible prochainement. Nous travaillons activement à son développement.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <RequiredDocumentsList
            requiredDocuments={requiredDocumentsList}
            documents={documents}
            handleUploadFiles={handleUploadFiles}
            handleDeleteItem={handleDeleteItem}
            getFileIcon={getFileIcon}
          />
        </TabsContent>
      </Tabs>
    </OutilIALayout>
  );
};

export default Financement;
