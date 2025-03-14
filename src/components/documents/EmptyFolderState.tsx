
import { Folder } from "lucide-react";

const EmptyFolderState = () => {
  return (
    <div className="text-center py-12 text-gray-500">
      <Folder className="h-12 w-12 mx-auto mb-2 opacity-40" />
      <p>Ce dossier est vide</p>
      <p className="text-sm mt-1">
        Créez un nouveau dossier ou téléchargez des fichiers pour commencer
      </p>
    </div>
  );
};

export default EmptyFolderState;
