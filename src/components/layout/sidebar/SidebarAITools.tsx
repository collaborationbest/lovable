
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AIToolItem } from "../navigationConfig";

interface SidebarAIToolsProps {
  tools: AIToolItem[];
  currentPath: string;
  collapsed: boolean;
}

const SidebarAITools = ({ tools, currentPath, collapsed }: SidebarAIToolsProps) => {
  return (
    <>
      <div className={cn("rounded-lg overflow-hidden", currentPath.includes('/outils-ia') && "bg-[#B88E23]/5")}>
        <Link to="/outils-ia" className={cn(
          "flex items-center gap-2 px-2 py-1.5 text-[#5C4E3D] hover:bg-[#B88E23]/10 transition-all duration-200", 
          currentPath === '/outils-ia' && "bg-[#B88E23]/10"
        )}>
          <FileText className="h-5 w-5 text-[#B88E23]" />
          {!collapsed && <span className="transition-opacity duration-200">Outils</span>}
        </Link>
      </div>

      {!collapsed && (
        <div className="pl-4 mt-1 pr-1">
          <ul className="space-y-1">
            {tools.map((tool) => (
              <li key={tool.label} className="relative">
                <Link
                  to={tool.href}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#5C4E3D] hover:bg-[#B88E23]/10 transition-all duration-200 text-sm",
                    currentPath === tool.href && "bg-[#B88E23]/10"
                  )}
                >
                  <tool.icon className="h-4 w-4 text-[#B88E23]" />
                  <span className="transition-opacity duration-200">{tool.label}</span>

                  {tool.soon && (
                    <Badge
                      variant="outline"
                      className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-[#FEC6A1]/20 text-[#8A4B38] border-[#FEC6A1]/30"
                    >
                      SOON
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default SidebarAITools;
