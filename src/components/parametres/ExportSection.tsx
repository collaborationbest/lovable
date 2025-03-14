
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { FileJson, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToJSON, exportToPDF } from "@/utils/exportUtils";

interface ExportSectionProps {
  user: User | null;
}

const ExportSection = ({ user }: ExportSectionProps) => {
  const handleExportJSON = async () => {
    try {
      // Fetch cabinet data for the current user
      const { data: cabinetData } = await supabase
        .from('cabinets')
        .select('*')
        .eq('owner_id', user?.id)
        .single() || { data: null };
      
      // Fetch team members associated with this cabinet
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('cabinet_id', cabinetData?.id) || { data: [] };
      
      // Fetch tasks (as a replacement for checklist items)
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('cabinet_id', cabinetData?.id) || { data: [] };
      
      const exportData = {
        teamMembers: teamMembers || [],
        city: cabinetData?.city || '',
        openingDate: cabinetData?.opening_date || '',
        tasks: tasks || []
      };
      
      await exportToJSON(exportData, 'cabinet-dental-data');
      toast({
        title: "Exportation réussie",
        description: "Les données ont été exportées au format JSON avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de l'exportation JSON:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      // Fetch cabinet data for the current user
      const { data: cabinetData } = await supabase
        .from('cabinets')
        .select('*')
        .eq('owner_id', user?.id)
        .single() || { data: null };
      
      // Fetch team members associated with this cabinet
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('cabinet_id', cabinetData?.id) || { data: [] };
      
      // Fetch tasks (as a replacement for checklist items)
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('cabinet_id', cabinetData?.id) || { data: [] };
      
      const exportData = {
        teamMembers: teamMembers || [],
        city: cabinetData?.city || '',
        openingDate: cabinetData?.opening_date || '',
        tasks: tasks || []
      };
      
      await exportToPDF(exportData, 'cabinet-dental-rapport');
      toast({
        title: "Exportation réussie",
        description: "Les données ont été exportées au format PDF avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de l'exportation PDF:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportation des données</CardTitle>
        <CardDescription>
          Exportez toutes les données de votre cabinet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#454240] mb-4">
          Vous pouvez exporter toutes les données de votre cabinet au format JSON ou PDF pour les sauvegarder ou les utiliser dans d'autres applications.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={handleExportJSON}
            className="bg-[#B88E23] hover:bg-[#927219] flex items-center gap-2"
          >
            <FileJson size={18} />
            Format JSON
          </Button>
          <Button 
            onClick={handleExportPDF}
            className="bg-[#B88E23] hover:bg-[#927219] flex items-center gap-2"
          >
            <FileText size={18} />
            Format PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportSection;
