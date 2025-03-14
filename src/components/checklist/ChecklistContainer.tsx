
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressChecklist from "@/components/ProgressChecklist";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  FileText, 
  CalendarDays, 
  ScrollText, 
  PiggyBank, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Plus 
} from "lucide-react";
import { Link } from "react-router-dom";
import { ChecklistItem } from "@/types/ChecklistItem";
import { Dialog } from "@/components/ui/dialog";
import AddChecklistItemDialog from "./AddChecklistItemDialog";

interface ChecklistContainerProps {
  checklist: ChecklistItem[];
  onChecklistItemClick: (id: string) => void;
  onAddChecklistItem: (newItem: ChecklistItem) => void;
}

const ChecklistContainer = ({ 
  checklist, 
  onChecklistItemClick, 
  onAddChecklistItem 
}: ChecklistContainerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fonction pour obtenir l'icône en fonction du titre ou de l'ID de l'élément
  const getIconForItem = (item: ChecklistItem) => {
    const title = item.title.toLowerCase();
    
    if (title.includes("local")) return MapPin;
    if (title.includes("business plan")) return FileText;
    if (title.includes("travaux")) return CalendarDays;
    if (title.includes("administratives")) return ScrollText;
    if (title.includes("financement")) return PiggyBank;
    if (title.includes("équipement") || title.includes("informatique")) return ShoppingCart;
    if (title.includes("personnel") || title.includes("recruter")) return Users;
    if (title.includes("croissance") || title.includes("rentabilité")) return TrendingUp;
    
    // Par défaut, retourner FileText
    return FileText;
  };

  // Fonction pour obtenir l'URL de l'outil IA correspondant
  const getToolUrlForItem = (item: ChecklistItem) => {
    const title = item.title.toLowerCase();
    
    if (title.includes("local")) return "/outils-ia/local";
    if (title.includes("business plan")) return "/outils-ia/business-plan";
    if (title.includes("travaux")) return "/outils-ia/travaux";
    if (title.includes("administratives")) return "/outils-ia/administratif";
    if (title.includes("financement")) return "/outils-ia/financement";
    if (title.includes("équipement") || title.includes("informatique")) return "/outils-ia/equipement";
    if (title.includes("personnel") || title.includes("recruter")) return "/outils-ia/recrutement";
    if (title.includes("croissance") || title.includes("rentabilité")) return "/outils-ia/rentabilite";
    
    // Par défaut, rediriger vers la page d'accueil
    return "/";
  };

  return (
    <Card className="border-[#B88E23]/20 overflow-hidden">
      <CardHeader className="p-1.5 md:p-2 text-left flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg md:text-xl text-[#5C4E3D]">Feuille de Route</CardTitle>
          <CardDescription className="text-xs md:text-sm text-[#454240]/80">
            Les étapes clés pour réussir l'installation de votre cabinet
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 p-0 border-[#B88E23] text-[#B88E23] hover:bg-[#B88E23]/10"
          onClick={() => setDialogOpen(true)}
        >
          <Plus size={16} />
          <span className="sr-only">Ajouter une étape</span>
        </Button>
      </CardHeader>
      <CardContent className="p-1 md:p-1.5 pt-0 md:pt-0">
        <div className="pr-1 custom-scrollbar">
          <ProgressChecklist 
            items={checklist}
            onItemClick={onChecklistItemClick}
            onAddItem={onAddChecklistItem}
            hideAddButton={true}
          />
        </div>
      </CardContent>

      {/* Add the dialog component with required existingItems prop */}
      <AddChecklistItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddItem={onAddChecklistItem}
        existingItems={checklist}
      />
    </Card>
  );
};

export default ChecklistContainer;
