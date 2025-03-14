
import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
         AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface PatientImportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: any[];
  onImport: () => Promise<void>;
  importInProgress: boolean;
}

const PatientImportPreview: React.FC<PatientImportPreviewProps> = ({
  open,
  onOpenChange,
  previewData,
  onImport,
  importInProgress
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Prévisualisation des données</AlertDialogTitle>
          <AlertDialogDescription>
            Voici un aperçu des patients qui seront importés. Vérifiez que les données sont correctes avant de confirmer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 overflow-x-auto">
          {previewData.length > 0 ? (
            <>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-2 text-left">Nom</th>
                    <th className="p-2 text-left">Nom de jeune fille</th>
                    <th className="p-2 text-left">Prénom</th>
                    <th className="p-2 text-left">Genre</th>
                    <th className="p-2 text-left">Date de naissance</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Téléphone</th>
                    <th className="p-2 text-left">Ville</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((patient, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{patient.last_name || patient.nom || "—"}</td>
                      <td className="p-2">{patient.maiden_name || "—"}</td>
                      <td className="p-2">{patient.first_name || patient.prenom || "—"}</td>
                      <td className="p-2">{patient.gender || "—"}</td>
                      <td className="p-2">{patient.birthdate || patient.dateNaissance || "—"}</td>
                      <td className="p-2">{patient.email || "—"}</td>
                      <td className="p-2">{patient.phone_number || patient.telephone || "—"}</td>
                      <td className="p-2">{patient.city || patient.ville || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {previewData.length - 5} patients supplémentaires non affichés...
                </p>
              )}
            </>
          ) : (
            <div className="text-center p-4">
              <p>Aucune donnée patient n'a été trouvée dans ce fichier.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Veuillez vérifier que le format du fichier est correct et qu'il contient des données.
              </p>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onImport} 
            disabled={importInProgress || previewData.length === 0}
          >
            {importInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importation...
              </>
            ) : (
              "Confirmer l'importation"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PatientImportPreview;
