
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/scroll-area";
import { Badge } from "@/components/ui/badge";
import { menuItems, aiTools } from "../navigationConfig";
import { Settings } from "lucide-react";

interface MobileSidebarProps {
  accessibleMenuItems: any[];
  hasAccess: (id: string) => boolean;
  currentPath: string;
}

const MobileSidebar = ({ accessibleMenuItems, hasAccess, currentPath }: MobileSidebarProps) => {
  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-center mb-6">
        <Link to="/">
          <img
            src="/lovable-uploads/1cc80bed-52e4-4216-903b-1a8170e9886a.png"
            alt="Dental Pilote Logo"
            className="h-12 object-contain"
          />
        </Link>
      </div>

      <ScrollArea className="max-h-[80vh]">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-[#5C4E3D] mb-3">Navigation principale</h2>
          <div className="grid grid-cols-3 gap-3">
            {accessibleMenuItems.map(item => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg text-[#5C4E3D]",
                  "hover:bg-[#B88E23]/10 transition-all duration-200",
                  currentPath === item.href && "bg-[#B88E23]/10"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-[#f5f2ee] flex items-center justify-center mb-2">
                  <item.icon className="h-5 w-5 text-[#B88E23]" />
                </div>
                <span className="text-xs text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {hasAccess('outils-ia') && (
          <div className="mb-4">
            <h2 className="text-lg font-medium text-[#5C4E3D] mb-3">Outils IA</h2>
            <div className="grid grid-cols-3 gap-3">
              {aiTools.map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg text-[#5C4E3D] relative",
                    "hover:bg-[#B88E23]/10 transition-all duration-200",
                    currentPath === item.href && "bg-[#B88E23]/10"
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-[#f5f2ee] flex items-center justify-center mb-2">
                    <item.icon className="h-5 w-5 text-[#B88E23]" />
                  </div>
                  <span className="text-xs text-center">{item.label}</span>
                  {item.soon && (
                    <Badge
                      variant="outline"
                      className="absolute top-0 right-0 text-[10px] px-1 py-0 h-4 bg-[#FEC6A1]/20 text-[#8A4B38] border-[#FEC6A1]/30"
                    >
                      SOON
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[#B88E23]/20">
          <Link 
            to="/parametres" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#5C4E3D] hover:bg-[#B88E23]/10"
          >
            <Settings className="h-5 w-5 text-[#B88E23]" />
            <span>Paramètres</span>
          </Link>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileSidebar;
