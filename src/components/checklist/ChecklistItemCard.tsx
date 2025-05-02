
import React from "react";
import { Check, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChecklistItem } from "@/types/ChecklistItem";
import { TOOL_BUTTON_STYLE, TOOL_ICON_SIZE } from "@/constants/styleConstants";
import ChecklistItemSteps from "./ChecklistItemSteps";
import { Button } from "@/components/ui/button";

interface ChecklistItemCardProps {
  item: ChecklistItem;
  isExpanded: boolean;
  icon: LucideIcon;
  route: string;
  onToggle: () => void;
  onStatusChange: () => void;
}

/**
 * Individual checklist item card with expandable details
 */
const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({
  item,
  isExpanded,
  icon: ItemIcon,
  route,
  onToggle,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  const navigateToTool = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(route);
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all mb-3 ${
        item.completed ? "border-[#B88E23]/40 bg-[#F1F0FB]/50" : "border-gray-200 hover:border-[#B88E23]/30"
      }`}
    >
      <div
        className="p-4 cursor-pointer hover:bg-[#F1F0FB]/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          {/* Left side with icon */}
          <div className="flex items-center w-[20%]">
            <button
              className={`${TOOL_BUTTON_STYLE} bg-[#F8F7FD]`}
              onClick={navigateToTool}
              title={`Accéder à l'outil IA: ${item.title}`}
            >
              <ItemIcon size={TOOL_ICON_SIZE} className="text-[#B88E23]" />
            </button>
          </div>

          {/* Center content with title and description */}
          <div className="flex flex-col items-start justify-center w-[60%]">
            <h3
              className={`text-sm font-medium ${
                item.completed ? "text-[#B88E23]" : "text-[#5C4E3D]"
              }`}
            >
              {item.title}
            </h3>
            <p className="text-sm text-[#454240]/80 mt-1 text-left">
              {item.description}
            </p>
          </div>

          {/* Right side with check button */}
          <div className="flex items-center justify-end w-[20%]">
            <Button
              variant="outline"
              size="icon"
              className={`${TOOL_BUTTON_STYLE} ${
                item.completed
                  ? "bg-[#B88E23] text-white hover:bg-[#A47D1F] hover:text-white border-[#B88E23]"
                  : "bg-[#F8F7FD] text-gray-400 hover:bg-[#F1F0FB] hover:text-[#B88E23] border-gray-200"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange();
              }}
              title={
                item.completed
                  ? "Marquer comme non terminé"
                  : "Marquer comme terminé"
              }
            >
              <Check size={TOOL_ICON_SIZE} />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && <ChecklistItemSteps steps={item.steps} />}
    </div>
  );
};

export default ChecklistItemCard;
