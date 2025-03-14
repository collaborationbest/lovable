
import React from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  FileText, 
  CalendarDays, 
  ScrollText, 
  PiggyBank, 
  ShoppingCart, 
  Users, 
  TrendingUp 
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const ToolCard = ({ icon, title, description, href }: ToolCardProps) => (
  <Link to={href} className="group">
    <div className="bg-white border border-[#B88E23]/10 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all hover:border-[#B88E23]/30 h-full flex flex-col items-center text-center">
      <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23] mb-3 md:mb-4 group-hover:bg-[#B88E23]/20 transition-all">
        {icon}
      </div>
      <h3 className="text-base md:text-lg font-medium text-[#5C4E3D] mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-[#5C4E3D]/70">{description}</p>
    </div>
  </Link>
);

const OutilsIA = () => {
  const tools = [
    {
      icon: <MapPin size={24} />,
      title: "Local",
      description: "Analysez et trouvez le local idéal pour votre cabinet dentaire.",
      href: "/outils-ia/local"
    },
    {
      icon: <FileText size={24} />,
      title: "Business Plan",
      description: "Créez un business plan solide pour votre cabinet dentaire.",
      href: "/outils-ia/business-plan"
    },
    {
      icon: <CalendarDays size={24} />,
      title: "Travaux",
      description: "Planifiez et gérez les travaux de votre cabinet dentaire.",
      href: "/outils-ia/travaux"
    },
    {
      icon: <ScrollText size={24} />,
      title: "Administratif",
      description: "Gérez efficacement les tâches administratives de votre cabinet.",
      href: "/outils-ia/administratif"
    },
    {
      icon: <PiggyBank size={24} />,
      title: "Financement",
      description: "Trouvez les meilleures options de financement pour votre cabinet.",
      href: "/outils-ia/financement"
    },
    {
      icon: <ShoppingCart size={24} />,
      title: "Équipement",
      description: "Sélectionnez le meilleur équipement pour votre cabinet dentaire.",
      href: "/outils-ia/equipement"
    },
    {
      icon: <Users size={24} />,
      title: "Recrutement",
      description: "Recrutez les meilleurs talents pour votre équipe dentaire.",
      href: "/outils-ia/recrutement"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Rentabilité",
      description: "Analysez et optimisez la rentabilité de votre cabinet dentaire.",
      href: "/outils-ia/rentabilite"
    }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      <Sidebar />
      <div className="flex-1 py-4 md:py-6 lg:py-8 px-3 md:px-4 lg:px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 md:mb-8 lg:mb-12">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#5C4E3D] mb-2 md:mb-3 lg:mb-4">Outils IA</h1>
            <p className="text-[#5C4E3D]/80 max-w-3xl mx-auto text-xs md:text-sm lg:text-base px-2">
              Des outils intelligents pour vous aider à gérer tous les aspects de votre cabinet dentaire, 
              de la recherche du local idéal à l'optimisation de la rentabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {tools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutilsIA;
