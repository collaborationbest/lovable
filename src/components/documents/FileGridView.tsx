
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical, Eye, Edit2, Trash2, Share2, File, Folder } from "lucide-react";

type FileGridViewProps = {
  folders: Folder[];
  documents: Document[];
  onOpenFolder: (folderId: string, folderName: string) => void;
  onRenameItem: (id: string, name: string, type: 'folder' | 'document') => void;
  onDeleteItem: (id: string, type: 'folder' | 'document', name: string) => void;
  onShareFolder: (folderId: string) => void;
  onPreviewDocument: (document: Document) => void;
};

type Folder = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
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

const FileGridView = ({
  folders,
  documents,
  onOpenFolder,
  onRenameItem,
  onDeleteItem,
  onShareFolder,
  onPreviewDocument
}: FileGridViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {folders.map((folder) => (
        <Card key={folder.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div 
              className="p-4 flex items-center cursor-pointer hover:bg-gray-50"
              onClick={() => onOpenFolder(folder.id, folder.name)}
            >
              <Folder className="h-10 w-10 mr-3 text-[#B88E23]" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-700 truncate">
                  {folder.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Dossier
                </p>
              </div>
              <div className="relative group">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md py-1 z-10 hidden group-hover:block">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameItem(folder.id, folder.name, 'folder');
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Renommer
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareFolder(folder.id);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(folder.id, 'folder', folder.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {documents.map((document) => (
        <Card key={document.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 flex items-center">
              <File className="h-10 w-10 mr-3 text-gray-500" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-700 truncate">
                  {document.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(document.size)}
                </p>
              </div>
              <div className="relative group">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md py-1 z-10 hidden group-hover:block">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => onPreviewDocument(document)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Prévisualiser
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => onRenameItem(document.id, document.name, 'document')}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Renommer
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={() => onDeleteItem(document.id, 'document', document.name)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

export default FileGridView;
