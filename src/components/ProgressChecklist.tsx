
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AddChecklistItemDialog from "@/components/checklist/AddChecklistItemDialog";
import ChecklistItemCard from "@/components/checklist/ChecklistItemCard";
import { getToolIcon } from "@/utils/iconMappingUtils";
import { TOOL_BUTTON_STYLE, TOOL_ICON_SIZE } from "@/constants/styleConstants";
import { ChecklistItem } from "@/types/ChecklistItem";

interface ProgressChecklistProps {
  items: ChecklistItem[];
  onItemClick: (id: string) => void;
  onAddItem?: (newItem: ChecklistItem) => void;
  hideAddButton?: boolean;
}

/**
 * A component that displays a list of checklist items with progress indicators
 * Allows for expanding/collapsing items and navigating to related tools
 */
const ProgressChecklist = ({ 
  items, 
  onItemClick, 
  onAddItem,
  hideAddButton = false
}: ProgressChecklistProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleAccordion = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleOpenAddDialog = () => {
    setDialogOpen(true);
  };

  const handleAddItem = (newItem: ChecklistItem) => {
    if (onAddItem) {
      onAddItem(newItem);
      toast({
        title: "Étape ajoutée",
        description: "La nouvelle étape a été ajoutée à votre feuille de route",
      });
    }
  };

  // Calculate the completion progress
  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-[#5C4E3D] mb-1">
          <span>Progression</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#B88E23] rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Checklist grid layout */}
      <div className="grid grid-cols-1 gap-2">
        {items.map((item) => {
          const { icon, route } = getToolIcon(item.title);
          
          return (
            <ChecklistItemCard
              key={item.id}
              item={item}
              isExpanded={expandedItems.includes(item.id)}
              icon={icon}
              route={route}
              onToggle={() => toggleAccordion(item.id)}
              onStatusChange={() => onItemClick(item.id)}
            />
          );
        })}
      </div>
      
      {!hideAddButton && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            className={`border-[#B88E23] text-[#B88E23] hover:bg-[#B88E23]/10 hover:text-[#B88E23] ${TOOL_BUTTON_STYLE}`}
            onClick={handleOpenAddDialog}
            title="Ajouter une étape"
          >
            <Plus size={TOOL_ICON_SIZE} />
          </Button>
        </div>
      )}

      <AddChecklistItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingItems={items}
        onAddItem={handleAddItem}
      />
    </div>
  );
};

export default ProgressChecklist;
