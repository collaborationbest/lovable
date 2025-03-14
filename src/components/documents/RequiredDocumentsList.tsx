
import { useRef } from "react";
import { CheckCircle, Info, PlusCircle, Trash2, File } from "lucide-react";
import { Button } from "@/components/ui/button";

type RequiredDocument = {
  id: string;
  name: string;
  description: string;
  category: string;
  isRequired: boolean;
};

type Document = {
  id: string;
  name: string;
  file_type: string;
  size: number;
  url: string;
  folder_id: string | null;
  created_at: string;
  document_type?: string;
};

type RequiredDocumentsListProps = {
  requiredDocuments: RequiredDocument[];
  documents: Document[];
  handleUploadFiles: (e: React.ChangeEvent<HTMLInputElement>, documentType?: string) => Promise<void>;
  handleDeleteItem: (id: string, type: 'folder' | 'document', name: string) => Promise<void>;
  getFileIcon: (fileType: string) => JSX.Element;
};

const RequiredDocumentsList = ({
  requiredDocuments,
  documents,
  handleUploadFiles,
  handleDeleteItem,
  getFileIcon
}: RequiredDocumentsListProps) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getUploadedDocumentsForType = (documentTypeId: string) => {
    return documents.filter(doc => doc.document_type === documentTypeId);
  };

  const triggerFileInput = (documentId: string) => {
    if (fileInputRefs.current[documentId]) {
      fileInputRefs.current[documentId]?.click();
    }
  };

  const groupedRequiredDocuments = requiredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, RequiredDocument[]>);

  return (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Cette liste présente tous les documents généralement exigés par les banques pour un prêt d'installation professionnel.
            Fournir des documents complets et bien organisés augmentera vos chances d'obtenir un financement dans de bonnes conditions.
          </p>
        </div>
      </div>

      {Object.entries(groupedRequiredDocuments).map(([category, docs]) => (
        <div key={category} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 font-medium text-gray-700">
            {category}
          </div>
          <div className="divide-y">
            {docs.map(doc => {
              const uploadedDocs = getUploadedDocumentsForType(doc.id);
              const hasUploads = uploadedDocs.length > 0;
              
              return (
                <div key={doc.id} className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 mr-3">
                        {hasUploads ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Info className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{doc.name}</h3>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                        
                        {hasUploads && (
                          <div className="mt-2 space-y-1">
                            {uploadedDocs.map(uploadedDoc => (
                              <div key={uploadedDoc.id} className="flex items-center text-sm text-gray-700">
                                {getFileIcon(uploadedDoc.file_type)}
                                <span className="ml-2">{uploadedDoc.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="ml-2 h-6 w-6 p-0"
                                  onClick={() => handleDeleteItem(uploadedDoc.id, 'document', uploadedDoc.name)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <input
                        type="file"
                        id={`file-upload-${doc.id}`}
                        className="hidden"
                        multiple
                        onChange={(e) => handleUploadFiles(e, doc.id)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        ref={el => fileInputRefs.current[doc.id] = el}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => triggerFileInput(doc.id)}
                        className="text-[#B88E23] border-[#B88E23] hover:bg-[#B88E23]/10"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequiredDocumentsList;
