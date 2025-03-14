import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderPlus, 
  Upload, 
  Folder, 
  FileText,
  List,
  LayoutGrid,
  Loader2,
  RefreshCw
} from "lucide-react";
import { 
  Folder as FolderType,
  Document as DocumentType,
  BreadcrumbItem,
  ViewMode
} from "@/components/documents/types";
import FolderBreadcrumb from "@/components/documents/FolderBreadcrumb";
import FileGridView from "@/components/documents/FileGridView";
import FileListView from "@/components/documents/FileListView";
import EmptyFolderState from "@/components/documents/EmptyFolderState";
import DocumentDialogs from "@/components/documents/DocumentDialogs";
import { getFileIcon, requiredDocumentsList } from "@/components/documents/DocumentsUtils";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Spinner } from "@/components/ui/spinner";

const Documents = () => {
  const navigate = useNavigate();
  const { isAdmin, userEmail } = useAccessControl();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "Accueil" }]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{id: string, name: string, type: 'folder' | 'document'} | null>(null);
  const [newName, setNewName] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [folderToShare, setFolderToShare] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState<DocumentType | null>(null);
  const [activeTab, setActiveTab] = useState("files");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchFoldersAndDocuments();
  }, [currentFolder, retryCount]);

  const fetchFoldersAndDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session }} = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to login");
        navigate('/auth');
        return;
      }

      console.log("Fetching folders for folder:", currentFolder, "with user:", userEmail);

      let folderQuery;
      if (currentFolder === null) {
        folderQuery = supabase
          .from('folders')
          .select('*')
          .is('parent_id', null);
      } else {
        folderQuery = supabase
          .from('folders')
          .select('*')
          .eq('parent_id', currentFolder);
      }

      const { data: folderData, error: folderError } = await folderQuery;

      if (folderError) {
        console.error("Error fetching folders:", folderError);
        throw folderError;
      }

      console.log("Folders fetched:", folderData?.length || 0);

      let documentQuery;
      if (currentFolder === null) {
        documentQuery = supabase
          .from('documents')
          .select('*')
          .is('folder_id', null);
      } else {
        documentQuery = supabase
          .from('documents')
          .select('*')
          .eq('folder_id', currentFolder);
      }

      const { data: documentData, error: documentError } = await documentQuery;

      if (documentError) {
        console.error("Error fetching documents:", documentError);
        throw documentError;
      }

      console.log("Documents fetched:", documentData?.length || 0);

      setFolders(folderData || []);
      setDocuments(documentData || []);
    } catch (error: any) {
      console.error("Error loading folders and documents:", error);
      setError(error.message || "Une erreur est survenue lors du chargement des dossiers et documents.");
      toast.error("Impossible de charger les dossiers et documents. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Le nom du dossier ne peut pas être vide.");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name: newFolderName,
          parent_id: currentFolder
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setFolders([...folders, data[0]]);
      }
      
      setNewFolderName("");
      setNewFolderDialogOpen(false);
      
      toast.success(`Le dossier "${newFolderName}" a été créé avec succès.`);
    } catch (error: any) {
      console.error("Erreur lors de la création du dossier:", error);
      toast.error("Impossible de créer le dossier: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleRenameItem = (id: string, name: string, type: 'folder' | 'document') => {
    setItemToRename({ id, name, type });
    setNewName(name);
    setRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!itemToRename || !newName.trim()) {
      toast.error("Le nouveau nom ne peut pas être vide.");
      return;
    }

    try {
      setLoading(true);
      
      if (itemToRename.type === 'folder') {
        const { error } = await supabase
          .from('folders')
          .update({ name: newName })
          .eq('id', itemToRename.id);
        
        if (error) throw error;
        
        setFolders(folders.map(folder => 
          folder.id === itemToRename.id ? { ...folder, name: newName } : folder
        ));
      } else {
        const { error } = await supabase
          .from('documents')
          .update({ name: newName })
          .eq('id', itemToRename.id);
        
        if (error) throw error;
        
        setDocuments(documents.map(doc => 
          doc.id === itemToRename.id ? { ...doc, name: newName } : doc
        ));
      }
      
      setRenameDialogOpen(false);
      setItemToRename(null);
      
      toast.success(`"${itemToRename.name}" a été renommé en "${newName}".`);
    } catch (error: any) {
      console.error("Erreur lors du renommage:", error);
      toast.error("Impossible de renommer l'élément: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, type: 'folder' | 'document', name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    try {
      setLoading(true);
      
      if (type === 'folder') {
        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setFolders(folders.filter(folder => folder.id !== id));
      } else {
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
      
      toast.success(`"${name}" a été supprimé.`);
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer l'élément: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareFolder = (folderId: string) => {
    setFolderToShare(folderId);
    
    const shareLink = `${window.location.origin}/share/folder/${folderId}`;
    setShareLink(shareLink);
    setShareDialogOpen(true);
  };

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
        toast.error("Seuls les fichiers PDF, PNG et JPG sont acceptés.");
        return;
      }
      
      const uploadedDocuments: DocumentType[] = [];
      
      for (const file of Array.from(files)) {
        console.log("Uploading file:", file.name, "Type:", file.type);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(bucket => bucket.name === 'documents')) {
          await supabase.storage.createBucket('documents', {
            public: true
          });
          console.log("Created documents bucket");
        }
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);
          
        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          throw uploadError;
        }
        
        console.log("File uploaded successfully:", uploadData?.path);
        
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
          
        const publicUrl = publicUrlData.publicUrl;
        console.log("Public URL:", publicUrl);
        
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            name: file.name,
            file_type: file.type,
            size: file.size,
            url: publicUrl,
            folder_id: currentFolder,
            document_type: documentType
          })
          .select();
          
        if (docError) {
          console.error("Error creating document record:", docError);
          throw docError;
        }
        
        console.log("Document record created:", docData);
        
        if (docData && docData.length > 0) {
          uploadedDocuments.push(docData[0]);
        }
      }
      
      setDocuments([...documents, ...uploadedDocuments]);
      
      toast.success(`${uploadedDocuments.length} fichier(s) téléchargé(s) avec succès.`);
    } catch (error: any) {
      console.error("Erreur lors du téléchargement des fichiers:", error);
      toast.error("Impossible de télécharger les fichiers: " + error.message);
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const handlePreviewDocument = async (document: DocumentType) => {
    setDocumentToPreview(document);
    setPreviewDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#5C4E3D]">Documents</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="mr-2"
              title="Rafraîchir"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              className="bg-[#B88E23] hover:bg-[#927219]"
              onClick={() => setNewFolderDialogOpen(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </Button>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button 
                className="bg-[#B88E23] hover:bg-[#927219]" 
                disabled={uploadLoading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {uploadLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Télécharger
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleUploadFiles}
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={uploadLoading}
              />
            </label>
          </div>
        </div>

        <Tabs defaultValue="files" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="files" className="flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              Mes documents
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "files" && (
            <div className="flex items-center space-x-1 bg-[#f5f2ee] p-1 rounded-md mt-4">
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-white text-[#5C4E3D]" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-white text-[#5C4E3D]" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          <TabsContent value="files">
            <FolderBreadcrumb 
              breadcrumbs={breadcrumbs} 
              onBreadcrumbClick={handleBreadcrumbClick}
            />

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8 text-[#B88E23] mr-3" />
                <p>Chargement en cours...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-64">
                <p className="text-red-500 mb-4">Erreur de chargement: {error}</p>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : (
              <>
                {folders.length === 0 && documents.length === 0 ? (
                  <EmptyFolderState />
                ) : (
                  <>
                    {viewMode === "grid" && (
                      <FileGridView
                        folders={folders}
                        documents={documents}
                        onOpenFolder={handleOpenFolder}
                        onRenameItem={handleRenameItem}
                        onDeleteItem={handleDeleteItem}
                        onShareFolder={handleShareFolder}
                        onPreviewDocument={handlePreviewDocument}
                      />
                    )}

                    {viewMode === "list" && (
                      <FileListView
                        folders={folders}
                        documents={documents}
                        onOpenFolder={handleOpenFolder}
                        onRenameItem={handleRenameItem}
                        onDeleteItem={handleDeleteItem}
                        onShareFolder={handleShareFolder}
                        onPreviewDocument={handlePreviewDocument}
                        getFileIcon={getFileIcon}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <DocumentDialogs
        newFolderDialogOpen={newFolderDialogOpen}
        setNewFolderDialogOpen={setNewFolderDialogOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleCreateFolder={handleCreateFolder}
        
        renameDialogOpen={renameDialogOpen}
        setRenameDialogOpen={setRenameDialogOpen}
        itemToRename={itemToRename}
        newName={newName}
        setNewName={setNewName}
        handleRename={handleRename}
        
        shareDialogOpen={shareDialogOpen}
        setShareDialogOpen={setShareDialogOpen}
        shareLink={shareLink}
        
        previewDialogOpen={previewDialogOpen}
        setPreviewDialogOpen={setPreviewDialogOpen}
        documentToPreview={documentToPreview}
      />
    </div>
  );
};

export default Documents;
