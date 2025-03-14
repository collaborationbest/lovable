
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  onLogout: () => Promise<void>;
  loading: boolean;
}

const Header = ({ onLogout, loading }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-[#5C4E3D]">Paramètres</h1>
      <div className="flex gap-2">
        <Button 
          onClick={onLogout} 
          variant="destructive"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <LogOut size={18} />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default Header;
