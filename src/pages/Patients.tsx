import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileUp, CircleCheck, PackageX } from "lucide-react";
import { toast } from "sonner";
import PatientsList from "@/components/patients/PatientsList";
import PatientImportDialog from "@/components/patients/PatientImportDialog";
import PatientImportPreview from "@/components/patients/PatientImportPreview";
import { Toaster } from "sonner";

interface PatientData {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  datenaissance: string;
  adresse?: string;
  ville?: string;
  codepostal?: string;
  lastappointment?: string;
  nextappointment?: string;
}

const Patients = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileImportOpen, setFileImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importInProgress, setImportInProgress] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importNotificationVisible, setImportNotificationVisible] = useState(false);
  const [importStatus, setImportStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [importProgress, setImportProgress] = useState(0);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("nom", { ascending: true });

      if (error) throw error;

      setPatients(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
      toast.error("Impossible de récupérer la liste des patients.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier à importer.");
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx') {
      toast.error("Veuillez importer un fichier CSV ou XLSX.");
      return;
    }

    setImportInProgress(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await supabase.functions.invoke("import-patients-preview", {
        body: formData,
      });

      if (response.error) throw response.error;

      setPreviewData(response.data.preview || []);
      setShowPreview(true);
    } catch (error) {
      console.error("Erreur lors de la prévisualisation du fichier:", error);
      toast.error("Impossible de lire le fichier. Vérifiez le format du fichier.");
    } finally {
      setImportInProgress(false);
    }
  };

  const confirmImport = async () => {
    if (!selectedFile) return;
    
    setImportNotificationVisible(true);
    setImportStatus('pending');
    setImportProgress(0);
    
    toast("Importation en cours", {
      description: "L'importation des patients a commencé. Vous serez notifié une fois terminée."
    });
    
    setImportInProgress(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      const response = await supabase.functions.invoke("import-patients", {
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (response.error) throw response.error;

      setImportProgress(100);
      setImportStatus('success');
      
      toast.success(`${response.data.count} patients ont été importés avec succès.`);
      
      setFileImportOpen(false);
      setShowPreview(false);
      setSelectedFile(null);
      fetchPatients();
      
      setTimeout(() => {
        setImportNotificationVisible(false);
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      setImportStatus('error');
      
      toast.error("Une erreur est survenue lors de l'importation des patients.");
      
      setTimeout(() => {
        setImportNotificationVisible(false);
      }, 7000);
    } finally {
      setImportInProgress(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.telephone?.includes(searchTerm)
  );

  return (
    <div className="flex h-screen bg-[#F9F9F9]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#5C4E3D]">Gestion des patients</h1>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setFileImportOpen(true)}
              className="bg-[#B88E23] hover:bg-[#B88E23]/90"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Importer des patients
            </Button>
          </div>
        </div>

        <Input
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md mb-6"
        />

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous les patients</TabsTrigger>
            <TabsTrigger value="recent">Patients récents</TabsTrigger>
            <TabsTrigger value="upcoming">Rendez-vous à venir</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#B88E23]" />
              </div>
            ) : (
              <PatientsList patients={filteredPatients} />
            )}
          </TabsContent>

          <TabsContent value="recent">
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">
                Cette vue affichera les patients récemment consultés.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">
                Cette vue affichera les patients avec des rendez-vous à venir.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PatientImportDialog 
        open={fileImportOpen} 
        onOpenChange={setFileImportOpen}
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        onUpload={handleFileUpload}
        importInProgress={importInProgress}
      />

      <PatientImportPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        previewData={previewData}
        onImport={confirmImport}
        importInProgress={importInProgress}
      />
      
      {importNotificationVisible && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-50 border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-sm">
              {importStatus === 'pending' && "Importation en cours..."}
              {importStatus === 'success' && "Importation terminée"}
              {importStatus === 'error' && "Erreur d'importation"}
            </h3>
            <button 
              onClick={() => setImportNotificationVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {importStatus === 'pending' && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-[#B88E23] h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Traitement des données en cours...
              </p>
            </>
          )}
          
          {importStatus === 'success' && (
            <div className="flex items-center text-green-600">
              <CircleCheck className="h-5 w-5 mr-2" />
              <span className="text-sm">Patients importés avec succès</span>
            </div>
          )}
          
          {importStatus === 'error' && (
            <div className="flex items-center text-red-600">
              <PackageX className="h-5 w-5 mr-2" />
              <span className="text-sm">Échec de l'importation</span>
            </div>
          )}
        </div>
      )}
      
      <Toaster />
    </div>
  );
};

export default Patients;
