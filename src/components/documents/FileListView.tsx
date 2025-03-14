
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2, Share2, File, Folder } from "lucide-react";

type FileListViewProps = {
  folders: Folder[];
  documents: Document[];
  onOpenFolder: (folderId: string, folderName: string) => void;
  onRenameItem: (id: string, name: string, type: 'folder' | 'document') => void;
  onDeleteItem: (id: string, type: 'folder' | 'document', name: string) => void;
  onShareFolder: (folderId: string) => void;
  onPreviewDocument: (document: Document) => void;
  getFileIcon: (fileType: string) => JSX.Element;
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

const FileListView = ({
  folders,
  documents,
  onOpenFolder,
  onRenameItem,
  onDeleteItem,
  onShareFolder,
  onPreviewDocument,
  getFileIcon
}: FileListViewProps) => {
  return (
    <div className="mb-8">
      <div className="bg-gray-50 rounded-t-lg p-3 grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b">
        <div className="col-span-6">Nom</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Taille</div>
        <div className="col-span-2">Date de création</div>
      </div>
      
      {folders.map((folder) => (
        <div key={folder.id} className="grid grid-cols-12 gap-4 p-3 border-b hover:bg-gray-50 group relative">
          <div 
            className="col-span-6 flex items-center cursor-pointer"
            onClick={() => onOpenFolder(folder.id, folder.name)}
          >
            <Folder className="h-5 w-5 mr-3 text-[#B88E23]" />
            <span className="truncate font-medium">{folder.name}</span>
          </div>
          <div className="col-span-2 text-sm text-gray-500 flex items-center">
            Dossier
          </div>
          <div className="col-span-2 text-sm text-gray-500 flex items-center">
            -
          </div>
          <div className="col-span-2 text-sm text-gray-500 flex items-center">
            {formatDate(folder.created_at)}
          </div>
          <div className="absolute right-8 opacity-0 group-hover:opacity-100 flex space-x-1 bg-gray-50 py-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onRenameItem(folder.id, folder.name, 'folder');
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShareFolder(folder.id);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(folder.id, 'folder', folder.name);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      {documents.map((document) => (
        <div key={document.id} className="grid grid-cols-12 gap-4 p-3 border-b hover:bg-gray-50 group relative">
          <div className="col-span-6 flex items-center">
            {getFileIcon(document.file_type)}
            <span className="ml-3 truncate font-medium">{document.name}</span>
          </div>
          <div className="col-span-2 text-sm text-gray-500 flex items-center">
            {document.file_type.split('/')[1]?.toUpperCase() || 'Document'}
          </div>
          <div className="col-span-2 text-sm text-gray-500 flex items-center">
            {formatFileSize(document.size)}
          </div>
          <div className="col-span-2 text-sm text-gray-500 flex items-center">
            {formatDate(document.created_at)}
          </div>
          <div className="absolute right-8 opacity-0 group-hover:opacity-100 flex space-x-1 bg-gray-50 py-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onPreviewDocument(document)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onRenameItem(document.id, document.name, 'document')}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDeleteItem(document.id, 'document', document.name)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      {folders.length === 0 && documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun élément dans ce dossier
        </div>
      )}
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default FileListView;
