
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DeleteAccountDialogProps {
  deleteConfirmation: string;
  isDeleteButtonDisabled: boolean;
  onDeleteConfirmationChange: (value: string) => void;
  onDeleteAccount: () => Promise<void>;
}

const DeleteAccountDialog = ({
  deleteConfirmation,
  isDeleteButtonDisabled,
  onDeleteConfirmationChange,
  onDeleteAccount
}: DeleteAccountDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer mon compte</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes vos données seront effacées et vous ne pourrez pas les récupérer.
            <br /><br />
            Pour confirmer la suppression de votre compte, veuillez saisir "SUPPRIMER" ci-dessous :
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Textarea 
            value={deleteConfirmation}
            onChange={(e) => onDeleteConfirmationChange(e.target.value)}
            placeholder="Tapez SUPPRIMER pour confirmer"
            className="resize-none"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onDeleteConfirmationChange("")}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDeleteAccount}
            disabled={isDeleteButtonDisabled}
            className={isDeleteButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}
          >
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
