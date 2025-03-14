
import { File } from "lucide-react";

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) {
    return <File className="h-5 w-5 text-red-500" />;
  } else if (fileType.includes('image')) {
    return <File className="h-5 w-5 text-blue-500" />;
  } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return <File className="h-5 w-5 text-green-500" />;
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return <File className="h-5 w-5 text-blue-700" />;
  } else {
    return <File className="h-5 w-5 text-gray-500" />;
  }
};

export const requiredDocumentsList = [
  {
    id: "1",
    name: "Pièce d'identité",
    description: "Carte d'identité, passeport ou titre de séjour en cours de validité.",
    category: "Identité",
    isRequired: true
  },
  {
    id: "2",
    name: "Justificatif de domicile",
    description: "Facture d'électricité, de gaz ou quittance de loyer de moins de 3 mois.",
    category: "Domicile",
    isRequired: true
  },
  {
    id: "3",
    name: "Bulletins de salaire",
    description: "Les 3 derniers bulletins de salaire.",
    category: "Revenus",
    isRequired: true
  },
  {
    id: "4",
    name: "Avis d'imposition",
    description: "Dernier avis d'imposition ou de non-imposition.",
    category: "Revenus",
    isRequired: true
  },
  {
    id: "5",
    name: "Relevés bancaires",
    description: "Relevés de tous vos comptes bancaires des 3 derniers mois.",
    category: "Patrimoine",
    isRequired: true
  },
  {
    id: "6",
    name: "Plan de financement",
    description: "Plan détaillé du financement du projet.",
    category: "Projet",
    isRequired: true
  },
  {
    id: "7",
    name: "Devis des travaux",
    description: "Devis détaillés pour l'aménagement du cabinet.",
    category: "Projet",
    isRequired: true
  },
  {
    id: "8",
    name: "Prévisionnel financier",
    description: "Business plan avec projection financière sur 3 ans.",
    category: "Projet",
    isRequired: true
  },
  {
    id: "9",
    name: "Diplômes",
    description: "Diplômes et certifications professionnelles.",
    category: "Professionnel",
    isRequired: true
  },
  {
    id: "10",
    name: "Contrat de bail",
    description: "Contrat de bail ou promesse de vente pour le local.",
    category: "Local",
    isRequired: true
  }
];
