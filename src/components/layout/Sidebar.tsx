
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { menuItems, aiTools } from "./navigationConfig";
import { useAccessControl } from "@/hooks/access-control";
import { usePageAccess } from "@/hooks/access-control/usePageAccess";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/scroll-area";
import SidebarLogo from "./sidebar/SidebarLogo";
import SidebarNavItem from "./sidebar/SidebarNavItem";
import SidebarAITools from "./sidebar/SidebarAITools";
import SidebarUserProfile from "./sidebar/SidebarUserProfile";
import MobileSidebar from "./sidebar/MobileSidebar";

const Sidebar = ({ mobileView = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [userEmailState, setUserEmailState] = useState("");
  const profileInitialized = useRef(false);

  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    isLoading: accessControlLoading,
    userEmail,
    isAccountOwner,
    isAdmin,
    isManager,
    userRole
  } = useAccessControl();

  const { profile, loading: profileLoading } = useUserProfile();

  // Use the usePageAccess hook to check if the user has access to each page
  const { hasAccess, isLoading: accessRightsLoading } = usePageAccess(
    userEmail,
    isAdmin,
    isAccountOwner,
    userRole
  );

  // Load profile data only once when available
  useEffect(() => {
    // Skip if already initialized
    if (profileInitialized.current) {
      return;
    }

    // Wait until we have loaded all necessary data
    if (profileLoading || accessControlLoading) {
      return;
    }

    console.log("Initializing profile data - should happen only once");

    // Set profile data from user_profiles if available
    if (profile) {
      const firstName = profile.first_name || "";
      const lastName = profile.last_name || "";

      if (firstName || lastName) {
        setDisplayName(`${firstName} ${lastName}`.trim());
        setUserEmailState(profile.email || "");
        profileInitialized.current = true;
        console.log("Profile initialized from user profile");
        return;
      }

      if (profile.email) {
        const emailName = profile.email.split('@')[0] || "";
        setDisplayName(emailName);
        setUserEmailState(profile.email);
        profileInitialized.current = true;
        console.log("Profile initialized from profile email");
        return;
      }
    }

    // Fallback to userEmail from accessControl if profile is not available
    if (userEmail) {
      const emailName = userEmail.split('@')[0] || "";
      setDisplayName(emailName);
      setUserEmailState(userEmail);
      profileInitialized.current = true;
      console.log("Profile initialized from access control email");
      return;
    }
  }, [profile, profileLoading, userEmail, accessControlLoading]);

  // Filter menu items based on access rights and admin requirements
  const accessibleMenuItems = menuItems.filter(item => {
    // Check if item requires admin access
    if (item.requiresAdmin && !isAdmin) {
      return false;
    }
    // Check if user has access to this page
    return hasAccess(item.id);
  });

  if (isMobile && !mobileView) {
    return null;
  }

  if (mobileView) {
    return <MobileSidebar 
      accessibleMenuItems={accessibleMenuItems} 
      hasAccess={hasAccess} 
      currentPath={location.pathname} 
    />;
  }

  return (
    <div className={cn("h-screen bg-white border-r border-[#B88E23]/20 transition-all duration-300 flex flex-col sticky top-0 left-0 mobile-hidden", collapsed ? "w-20" : "w-64")}>
      <SidebarLogo collapsed={collapsed} setCollapsed={setCollapsed} />

      <ScrollArea className="flex-1 overflow-auto custom-scrollbar sidebar-scroll-area">
        <nav className="p-2">
          <ul className="space-y-1">
            {accessibleMenuItems.map(item => (
              <SidebarNavItem 
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
                collapsed={collapsed}
              />
            ))}
          </ul>

          {!collapsed && hasAccess('outils-ia') && <div className="mt-4 mb-1">
            <span className="text-xs font-semibold text-[#5C4E3D]/60 px-2">
              OUTILS
            </span>
          </div>}

          {hasAccess('outils-ia') && (
            <SidebarAITools 
              tools={aiTools} 
              currentPath={location.pathname}
              collapsed={collapsed} 
            />
          )}
        </nav>
      </ScrollArea>

      <div className="mt-auto p-2 border-t border-[#B88E23]/20 py-0">
        <SidebarUserProfile 
          displayName={displayName}
          userEmail={userEmailState}
          currentPath={location.pathname}
          collapsed={collapsed}
          profileInitialized={profileInitialized.current}
        />
      </div>
    </div>
  );
};

export default Sidebar;
