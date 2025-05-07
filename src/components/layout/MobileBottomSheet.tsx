
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useAccessControl } from "@/hooks/access-control";
import { usePageAccess } from "@/hooks/access-control/usePageAccess";
import { menuItems, aiTools } from "./navigationConfig";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";

interface MobileBottomSheetProps {
  className?: string;
}

export const MobileBottomSheet = ({ className }: MobileBottomSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const location = useLocation();
  const {
    isLoading,
    userEmail,
    isAccountOwner,
    isAdmin,
    isManager,
    userRole
  } = useAccessControl();

  const { profile, loading: profileLoading } = useUserProfile();

  const { hasAccess, isLoading: accessRightsLoading } = usePageAccess(
    userEmail,
    isAdmin,
    isAccountOwner,
    userRole
  );

  useEffect(() => {
    if (profileLoading || isLoading) return;

    if (profile) {
      const firstName = profile.first_name || "";
      const lastName = profile.last_name || "";

      if (firstName || lastName) {
        setDisplayName(`${firstName} ${lastName}`.trim());
        return;
      }

      if (profile.email) {
        const emailName = profile.email.split('@')[0] || "";
        setDisplayName(emailName);
        return;
      }
    }

    if (userEmail) {
      const emailName = userEmail.split('@')[0] || "";
      setDisplayName(emailName);
      return;
    }

    setDisplayName("User");
  }, [profile, profileLoading, userEmail, isLoading]);

  const isAuthPage = location.pathname === '/auth' ||
    location.pathname === '/reset-password' ||
    location.pathname.includes('/magic-link');

  if (isAuthPage) {
    return null;
  }

  // Filter menu items based on access rights
  const accessibleMenuItems = menuItems.filter(item => {
    if (item.requiresAdmin && !isAdmin) {
      return false;
    }
    return hasAccess(item.id);
  });

  const centeredTitlePages = ['/', '/planning', '/documents', '/centre-aide'];
  const needsCenteredTitle = centeredTitlePages.includes(location.pathname);

  return (
    <div className={cn("md:hidden", className)}>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "fixed top-4 left-4 z-40 mobile-menu-button",
              needsCenteredTitle ? "mt-2" : ""
            )}
          >
            <Menu className="h-5 w-5 text-[#B88E23]" />
            <span className="sr-only">Open mobile menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[85vh] pt-6 pb-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/1cc80bed-52e4-4216-903b-1a8170e9886a.png"
                alt="Dental Pilote Logo"
                className="h-10 object-contain"
              />
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5 text-[#B88E23]" />
                <span className="sr-only">Close mobile menu</span>
              </Button>
            </DrawerClose>
          </div>

          {!isLoading && displayName && (
            <div className="flex items-center mb-6 px-4 py-2 bg-[#f5f2ee] rounded-lg">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-[#B88E23]" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-[#5C4E3D] truncate">{displayName}</p>
                {userEmail && (
                  <p className="text-xs text-[#5C4E3D]/70 truncate">{userEmail}</p>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[calc(85vh-120px)] custom-scrollbar pr-2">
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
                      location.pathname === item.href && "bg-[#B88E23]/10"
                    )}
                    onClick={() => setIsOpen(false)}
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
                        location.pathname === item.href && "bg-[#B88E23]/10"
                      )}
                      onClick={() => setIsOpen(false)}
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

            {/* Always show the Settings link regardless of access rights */}
            <div className="mt-4 pt-4 border-t border-[#B88E23]/20">
              <Link
                to="/parametres"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#5C4E3D] hover:bg-[#B88E23]/10"
                onClick={() => setIsOpen(false)}
              >
                <div className="h-8 w-8 rounded-full bg-[#f5f2ee] flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#B88E23]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <span>Paramètres</span>
              </Link>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileBottomSheet;
