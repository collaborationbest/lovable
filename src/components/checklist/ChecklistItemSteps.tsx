
import React from "react";

interface ChecklistItemStepsProps {
  steps: string[];
}

/**
 * Renders a list of steps for a checklist item
 */
const ChecklistItemSteps: React.FC<ChecklistItemStepsProps> = ({ steps }) => {
  return (
    <div className="px-1 pb-1 pt-0">
      <div className="pl-5 mt-0.5 border-l border-dashed border-[#B88E23]/30">
        <ul className="space-y-0.5">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-[#B88E23]/60 mt-1.5"></span>
              <span className="text-xs text-[#454240] flex-1 text-left">
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChecklistItemSteps;
