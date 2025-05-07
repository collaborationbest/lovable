
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

interface SidebarUserProfileProps {
  displayName: string;
  userEmail: string;
  currentPath: string;
  collapsed: boolean;
  profileInitialized: boolean;
}

const SidebarUserProfile = ({ displayName, userEmail, currentPath, collapsed, profileInitialized }: SidebarUserProfileProps) => {
  if (!profileInitialized || (!displayName && !userEmail)) {
    return null;
  }

  return (
    <div className={cn("rounded-lg overflow-hidden mb-2", collapsed ? "py-1" : "p-2")}>
      {!collapsed && <div className="mb-2 px-1">
        <p className="text-xs text-[#5C4E3D]/60 font-medium text-center">COMPTE</p>

        {displayName && (
          <div className="flex flex-col items-center mt-2">
            <p className="text-sm text-[#5C4E3D] font-medium text-center truncate max-w-full">
              {displayName}
            </p>
          </div>
        )}

        {userEmail && (
          <p className="text-xs text-[#5C4E3D]/70 text-center mt-1 truncate max-w-full">{userEmail}</p>
        )}
      </div>}

      <div className="flex justify-center">
        <Link
          to="/parametres"
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#5C4E3D] hover:bg-[#B88E23]/10 transition-all duration-200",
            currentPath === '/parametres' && "bg-[#B88E23]/10",
            collapsed ? "justify-center" : ""
          )}
        >
          <Settings className="h-5 w-5 text-[#B88E23]" />
          {!collapsed && <span>Paramètres</span>}
        </Link>
      </div>
    </div>
  );
};

export default SidebarUserProfile;
