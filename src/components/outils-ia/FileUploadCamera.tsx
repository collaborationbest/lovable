
import React, { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { getFileIconByType } from "@/utils/fileIconUtils";

interface FileUploadCameraProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  accept?: string; // Added accept prop as an alternative to acceptedTypes
  maxSizeMB?: number;
  label?: string;
  selectedFile?: File | null;
  preview?: string | null;
  onClearFile?: () => void;
  className?: string;
  cameraClassName?: string;
  uploadClassName?: string;
}

const FileUploadCamera: React.FC<FileUploadCameraProps> = ({
  onFileSelect,
  acceptedTypes = "image/*,application/pdf",
  accept, // New prop
  maxSizeMB = 5,
  label = "Photo ou document",
  selectedFile = null,
  preview = null,
  onClearFile,
  className,
  cameraClassName,
  uploadClassName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(!!preview);
  const [previewError, setPreviewError] = useState(false);
  const isMobile = useIsMobile();

  // Use accept prop if provided, otherwise use acceptedTypes
  const fileAcceptTypes = accept || acceptedTypes;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`La taille du fichier ne doit pas dépasser ${maxSizeMB}MB`);
        return;
      }
      onFileSelect(file);
      setShowPreview(true);
      setPreviewError(false);
    }
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    if (onClearFile) {
      onClearFile();
      setShowPreview(false);
      setPreviewError(false);
    }
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

  const renderPreview = () => {
    if (!showPreview) return null;
    
    if (preview) {
      if (typeof preview === 'string' && (preview.toLowerCase().endsWith('.pdf') || previewError)) {
        const FileIcon = getFileIconByType(preview);
        return <div className="mt-3 relative">
            <div className="flex items-center p-2 bg-gray-100 rounded-md">
              <FileIcon className="h-5 w-5 text-[#B88E23] mr-2" />
              <span className="text-sm text-[#5C4E3D] truncate">
                {selectedFile?.name || preview.split('/').pop() || "Document"}
              </span>
            </div>
            <button onClick={handleClearFile} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>;
      } else if (preview.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/)) {
        return <div className="mt-3 relative">
            <img 
              src={preview} 
              alt="Aperçu" 
              className="w-full max-h-40 object-contain rounded-md" 
              onError={handleImageError}
            />
            <button onClick={handleClearFile} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm border border-gray-200">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>;
      } else {
        const FileIcon = getFileIconByType(preview);
        return <div className="mt-3 relative">
            <div className="flex items-center p-2 bg-gray-100 rounded-md">
              <FileIcon className="h-5 w-5 text-[#B88E23] mr-2" />
              <span className="text-sm text-[#5C4E3D] truncate">
                {selectedFile?.name || preview.split('/').pop() || "Fichier"}
              </span>
            </div>
            <button onClick={handleClearFile} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>;
      }
    }
    
    if (selectedFile) {
      const fileName = selectedFile.name;
      const FileIcon = getFileIconByType(fileName);
      return <div className="mt-3 relative">
          <div className="flex items-center p-2 bg-gray-100 rounded-md">
            <FileIcon className="h-5 w-5 text-[#B88E23] mr-2" />
            <span className="text-sm text-[#5C4E3D] truncate">
              {fileName || "Fichier sélectionné"}
            </span>
          </div>
          <button onClick={handleClearFile} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>;
    }
    
    return null;
  };

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="flex flex-col">
        <p className="text-sm text-[#5C4E3D] mb-2">{label}</p>
        
        <div className="flex gap-2">
          {isMobile && (
            <>
              <Button 
                type="button" 
                variant="outline" 
                className={`flex-1 border-dashed border-[#B88E23]/30 hover:border-[#B88E23] hover:bg-[#B88E23]/5 ${cameraClassName || ''}`}
                onClick={handleCameraClick}
              >
                <Camera className="h-4 w-4 mr-2 text-[#B88E23]" />
                <span>Caméra</span>
              </Button>
              <Input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                ref={cameraInputRef}
              />
            </>
          )}
          
          <Button 
            type="button" 
            variant="outline" 
            className={`flex-1 border-dashed border-[#B88E23]/30 hover:border-[#B88E23] hover:bg-[#B88E23]/5 ${uploadClassName || ''}`}
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4 mr-2 text-[#B88E23]" />
            <span>Importer</span>
          </Button>
          <Input
            type="file"
            accept={fileAcceptTypes}
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      </div>
      
      {renderPreview()}
    </div>
  );
};

export default FileUploadCamera;
