
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Plus, Search } from "lucide-react";
import { PageHeader as MainPageHeader } from "@/components/layout/PageHeader";

interface PageHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PageHeader = ({ searchQuery, onSearchChange }: PageHeaderProps) => {
  return (
    <>
      <MainPageHeader 
        title="Boites à outils" 
        icon={<Briefcase size={20} />}
      />
      
      <div className="flex gap-3 w-full mb-6 mt-6">
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
    </>
  );
};

export default PageHeader;
