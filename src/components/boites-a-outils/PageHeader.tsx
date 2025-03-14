
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Plus, Search } from "lucide-react";

interface PageHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PageHeader = ({ searchQuery, onSearchChange }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="h-12 w-12 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23]">
          <Briefcase size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#5C4E3D]">Boites à outils</h1>
          <p className="text-[#5C4E3D]/70">Gérez vos contacts professionnels clés</p>
        </div>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5C4E3D]/50" />
          <Input
            className="pl-8 pr-4 py-2 w-full"
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-[#B88E23] hover:bg-[#8A6A1B] text-white">
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </DialogTrigger>
      </div>
    </div>
  );
};

export default PageHeader;
