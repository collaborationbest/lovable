
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccessControl, ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";
import { ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, Users, FileText, Settings, MapPin, PiggyBank, ScrollText, ShoppingCart, TrendingUp, ClipboardList, UserRound, AlertCircle, Briefcase, HelpCircle } from "lucide-react";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  id: string;
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    hasAccess,
    loading,
    userEmail,
    isAccountOwner
  } = useAccessControl();

  const menuItems: MenuItem[] = [
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
      icon: Briefcase,
      label: "Boites à outils",
      href: "/boites-a-outils",
      id: "boites-a-outils"
    },
    {
      icon: HelpCircle,
      label: "Centre d'aide",
      href: "/centre-aide",
      id: "centre-aide"
    }
  ];

  const aiTools: MenuItem[] = [
    {
      icon: MapPin,
      label: "Local",
      href: "/outils-ia/local",
      id: "outils-ia"
    },
    {
      icon: FileText,
      label: "Business Plan",
      href: "/outils-ia/business-plan",
      id: "outils-ia"
    },
    {
      icon: CalendarDays,
      label: "Travaux",
      href: "/outils-ia/travaux",
      id: "outils-ia"
    },
    {
      icon: ScrollText,
      label: "Administratif",
      href: "/outils-ia/administratif",
      id: "outils-ia"
    },
    {
      icon: PiggyBank,
      label: "Financement",
      href: "/outils-ia/financement",
      id: "outils-ia"
    },
    {
      icon: ShoppingCart,
      label: "Équipement",
      href: "/outils-ia/equipement",
      id: "outils-ia"
    },
    {
      icon: Users,
      label: "Recrutement",
      href: "/outils-ia/recrutement",
      id: "outils-ia"
    },
    {
      icon: TrendingUp,
      label: "Rentabilité",
      href: "/outils-ia/rentabilite",
      id: "outils-ia"
    }
  ];

  const ownerDisplayName = isAccountOwner
    ? "Dr. Raphael Haddad"
    : userEmail || ACCOUNT_OWNER_EMAIL;

  useEffect(() => {
    if (!loading) {
      const currentPath = location.pathname;
      const currentPageId = menuItems.find(item => item.href === currentPath)?.id || (currentPath.includes('outils-ia') ? 'outils-ia' : '');
      if (currentPageId && !hasAccess(currentPageId) && currentPath !== '/') {
        navigate('/');
      }
    }
  }, [location.pathname, hasAccess, loading, navigate]);

  // Filter menu items based on access rights
  const accessibleMenuItems = menuItems.filter(item => hasAccess(item.id));
  console.log(accessibleMenuItems)

  return <div className={cn("h-screen bg-white border-r border-[#B88E23]/20 transition-all duration-300 flex flex-col sticky top-0 left-0", collapsed ? "w-20" : "w-64")}>
    <div className={cn("flex items-center gap-2 p-2 border-b border-[#B88E23]/20", collapsed ? "justify-center" : "justify-between")}>
      <div className="flex items-center gap-2">
        {!collapsed ? (
          <img
            src="/lovable-uploads/e1ad73fc-124f-4e56-928d-959192e30330.png"
            alt="Dental Pilote Logo"
            className="h-10 object-contain"
          />
        ) : (
          <img
            src="/lovable-uploads/e1ad73fc-124f-4e56-928d-959192e30330.png"
            alt="Dental Pilote Logo"
            className="h-8 w-8 object-contain"
            style={{ objectPosition: "left" }}
          />
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hover:bg-[#B88E23]/10">
        {collapsed ? <ChevronRight className="h-4 w-4 text-[#B88E23]" /> : <ChevronLeft className="h-4 w-4 text-[#B88E23]" />}
      </Button>
    </div>

    <nav className="flex-1 p-2 overflow-y-auto custom-scrollbar">
      <ul className="space-y-1">
        {accessibleMenuItems.map(item => (
          <li key={item.label}>
            <Link to={item.href} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#5C4E3D] hover:bg-[#B88E23]/10 transition-all duration-200", location.pathname === item.href && "bg-[#B88E23]/10")}>
              <item.icon className="h-5 w-5 text-[#B88E23]" />
              {!collapsed && <span className="transition-opacity duration-200">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {!collapsed && hasAccess('outils-ia') && <div className="mt-4 mb-1">
        <span className="text-xs font-semibold text-[#5C4E3D]/60 px-2">
          OUTILS IA
        </span>
      </div>}
      {hasAccess('outils-ia') && <div className={cn("rounded-lg overflow-hidden", location.pathname.includes('/outils-ia') && "bg-[#B88E23]/5")}>
        <Link to="/outils-ia" className={cn("flex items-center gap-2 px-2 py-1.5 text-[#5C4E3D] hover:bg-[#B88E23]/10 transition-all duration-200", (location.pathname === '/outils-ia' || location.pathname.includes('/outils-ia/')) && "bg-[#B88E23]/10")}>
          <FileText className="h-5 w-5 text-[#B88E23]" />
          {!collapsed && <span className="transition-opacity duration-200">Outils IA</span>}
        </Link>
      </div>}
    </nav>

    <div className="mt-auto p-2 border-t border-[#B88E23]/20 py-0">
      <div className={cn("rounded-lg overflow-hidden mb-2", collapsed ? "py-1" : "p-2")}>
        {!collapsed && <div className="mb-2 px-1">
          <p className="text-xs text-[#5C4E3D]/60 font-medium">COMPTE</p>
          <p className="text-sm text-[#5C4E3D] font-medium truncate">{ownerDisplayName}</p>
        </div>}

        {hasAccess('parametres') ? (
          <Link to="/parametres" className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#5C4E3D] hover:bg-[#B88E23]/10 transition-all duration-200", location.pathname === '/parametres' && "bg-[#B88E23]/10")}>
            <Settings className="h-5 w-5 text-[#B88E23]" />
            {!collapsed && <span>Paramètres</span>}
          </Link>
        ) : null}
      </div>
    </div>
  </div>;
};

export default Sidebar;
