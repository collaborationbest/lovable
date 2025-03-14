
import { Doctor } from "@/types/Doctor";

/**
 * Types et interfaces pour le profil du cabinet
 */

export interface UserProfileDialogProps {
  /** État d'ouverture du dialogue */
  open: boolean;
  /** Fonction appelée à la fermeture du dialogue */
  onClose: () => void;
  /** Liste initiale des praticiens */
  initialDoctors: Doctor[];
  /** Fonction appelée lors de la sauvegarde des praticiens */
  onSave: (doctors: Doctor[]) => void;
  /** Ville actuelle du cabinet */
  currentCity: string;
  /** Fonction appelée lors du changement de ville */
  onCityChange: (city: string) => void;
  /** Date d'ouverture actuelle du cabinet (format ISO) */
  currentOpeningDate?: string;
  /** Fonction appelée lors du changement de la date d'ouverture */
  onOpeningDateChange?: (date: string) => void;
  /** Option pour masquer le bouton de fermeture du dialogue */
  hideCloseButton?: boolean;
  /** Nom actuel du cabinet */
  currentCabinetName?: string;
  /** Fonction appelée lors du changement du nom du cabinet */
  onCabinetNameChange?: (name: string) => void;
  /** Statut actuel du cabinet (en activité ou en création) */
  currentCabinetStatus?: string;
  /** Fonction appelée lors du changement du statut du cabinet */
  onCabinetStatusChange?: (status: string) => void;
}
