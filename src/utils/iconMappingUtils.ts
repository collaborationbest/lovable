
import { 
  MapPin, 
  FileText, 
  CalendarDays, 
  ScrollText, 
  PiggyBank, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  LucideIcon
} from "lucide-react";

interface ToolIconMapping {
  icon: LucideIcon;
  route: string;
}

/**
 * Maps checklist item titles to appropriate icons and routes
 * @param title The title of the checklist item
 * @returns Object containing the icon component and route
 */
export const getToolIcon = (title: string): ToolIconMapping => {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("local") || titleLower.includes("cabinet")) {
    return { icon: MapPin, route: "/outils-ia/local" };
  }
  if (titleLower.includes("business") || titleLower.includes("plan") || titleLower.includes("financier")) {
    return { icon: FileText, route: "/outils-ia/business-plan" };
  }
  if (titleLower.includes("travaux") || titleLower.includes("chantier")) {
    return { icon: CalendarDays, route: "/outils-ia/travaux" };
  }
  if (titleLower.includes("administratif") || titleLower.includes("démarche")) {
    return { icon: ScrollText, route: "/outils-ia/administratif" };
  }
  if (titleLower.includes("financement") || titleLower.includes("banque")) {
    return { icon: PiggyBank, route: "/outils-ia/financement" };
  }
  if (titleLower.includes("équipement") || titleLower.includes("matériel")) {
    return { icon: ShoppingCart, route: "/outils-ia/equipement" };
  }
  if (titleLower.includes("recrutement") || titleLower.includes("équipe") || titleLower.includes("personnel")) {
    return { icon: Users, route: "/outils-ia/recrutement" };
  }
  if (titleLower.includes("rentabilité") || titleLower.includes("croissance") || titleLower.includes("gestion")) {
    return { icon: TrendingUp, route: "/outils-ia/rentabilite" };
  }

  // Default icon if no match is found
  return { icon: FileText, route: "/outils-ia/local" };
};
