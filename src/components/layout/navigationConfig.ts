
import { 
  LayoutDashboard, CalendarDays, 
  Users, FileText, Settings, HelpCircle, 
  ClipboardList, UserRound, FileQuestion, 
  CreditCard, Receipt, Scan, ScrollText, 
  MessageSquareText, ShoppingCart, PiggyBank, 
  Package, TrendingUp, PhoneCall, KeyRound,
  AlertCircle, Calendar
} from "lucide-react";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  id: string;
  requiresAdmin?: boolean;
}

export interface AIToolItem extends MenuItem {
  soon?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Tableau de bord",
    href: "/",
    id: "dashboard"
  },
  {
    icon: ClipboardList,
    label: "Opérations",
    href: "/operations",
    id: "operations"
  },
  {
    icon: CalendarDays,
    label: "Planning",
    href: "/planning",
    id: "planning"
  },
  {
    icon: Users,
    label: "Équipe",
    href: "/equipe",
    id: "equipe"
  },
  {
    icon: UserRound,
    label: "Patients",
    href: "/patients",
    id: "patients"
  },
  {
    icon: FileText,
    label: "Documents",
    href: "/documents",
    id: "documents"
  },
  {
    icon: HelpCircle,
    label: "Centre d'aide",
    href: "/centre-aide",
    id: "centre-aide"
  },
  {
    icon: KeyRound,
    label: "Gestion des droits",
    href: "/gestion-droits",
    id: "gestion-droits",
    requiresAdmin: true
  }
];

export const aiTools: AIToolItem[] = [
  {
    icon: FileQuestion,
    label: "Questionnaire médical",
    href: "/outils-ia/questionnaire-medical",
    id: "outils-ia"
  },
  {
    icon: Calendar,
    label: "Demande RDV",
    href: "/outils-ia/demande-rdv",
    id: "outils-ia"
  },
  {
    icon: AlertCircle,
    label: "Recouvrement",
    href: "/outils-ia/recouvrement",
    id: "outils-ia"
  },
  {
    icon: Receipt,
    label: "Suivi des devis",
    href: "/outils-ia/suivi-devis",
    id: "outils-ia"
  },
  {
    icon: Scan,
    label: "Tracabilité implantaire",
    href: "/outils-ia/tracabilite-implantaire",
    id: "outils-ia"
  },
  {
    icon: CreditCard,
    label: "Paiement échelonné",
    href: "/outils-ia/paiement-echelonne",
    id: "outils-ia"
  },
  {
    icon: Users,
    label: "Recrutement",
    href: "/outils-ia/recrutement",
    id: "outils-ia",
    soon: true
  },
  {
    icon: ScrollText,
    label: "Administratif",
    href: "/outils-ia/administratif",
    id: "outils-ia",
    soon: true
  },
  {
    icon: MessageSquareText,
    label: "Compte rendu IA",
    href: "/outils-ia/compte-rendu-ia",
    id: "outils-ia",
    soon: true
  },
  {
    icon: ShoppingCart,
    label: "Équipement",
    href: "/outils-ia/equipement",
    id: "outils-ia",
    soon: true
  },
  {
    icon: PiggyBank,
    label: "Financement",
    href: "/outils-ia/financement",
    id: "outils-ia",
    soon: true
  },
  {
    icon: Package,
    label: "Gestion de Stock",
    href: "/outils-ia/stock",
    id: "outils-ia",
    soon: true
  },
  {
    icon: TrendingUp,
    label: "Rentabilité",
    href: "/outils-ia/rentabilite",
    id: "outils-ia",
    soon: true
  },
  {
    icon: PhoneCall,
    label: "Secrétariat",
    href: "/outils-ia/secretariat",
    id: "outils-ia",
    soon: true
  }
];
