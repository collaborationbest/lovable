
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
}

const SidebarNavItem = ({ href, label, icon: Icon, isActive, collapsed }: SidebarNavItemProps) => {
  // Track navigation from sidebar to avoid loading spinners
  const handleNavClick = () => {
    sessionStorage.setItem('lastNavigationTime', Date.now().toString());
  };

  return (
    <li>
      <Link 
        to={href} 
        onClick={handleNavClick}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#5C4E3D] hover:bg-[#B88E23]/10 transition-all duration-200", 
          isActive && "bg-[#B88E23]/10"
        )}
      >
        <Icon className="h-5 w-5 text-[#B88E23]" />
        {!collapsed && <span className="transition-opacity duration-200">{label}</span>}
      </Link>
    </li>
  );
};

export default SidebarNavItem;
