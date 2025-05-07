
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLogoProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarLogo = ({ collapsed, setCollapsed }: SidebarLogoProps) => {
  return (
    <div className={cn("flex items-center gap-2 p-2 border-b border-[#B88E23]/20", collapsed ? "justify-center" : "justify-between")}>
      <Link to="/" className="flex items-center gap-2">
        {!collapsed ? (
          <img
            src="/lovable-uploads/1cc80bed-52e4-4216-903b-1a8170e9886a.png"
            alt="Dental Pilote Logo"
            className="h-10 object-contain"
          />
        ) : (
          <img
            src="/lovable-uploads/52094cc3-5b77-46af-8273-e467119276c9.png"
            alt="Dental Pilote Icon"
            className="h-8 w-8 object-contain"
          />
        )}
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hover:bg-[#B88E23]/10">
        {collapsed ? <ChevronRight className="h-4 w-4 text-[#B88E23]" /> : <ChevronLeft className="h-4 w-4 text-[#B88E23]" />}
      </Button>
    </div>
  );
};

export default SidebarLogo;
