
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChecklistItem } from "@/types/ChecklistItem";
import { Plus, X, Send, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TOOL_BUTTON_STYLE, TOOL_ICON_SIZE } from "@/constants/styleConstants";

interface AddChecklistItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: ChecklistItem) => void;
  existingItems: ChecklistItem[];
}

const AddChecklistItemDialog: React.FC<AddChecklistItemDialogProps> = ({
  open,
  onOpenChange,
  onAddItem,
  existingItems
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [error, setError] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0: titre, 1: description, 2: sous-étapes
  const { toast } = useToast();

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setSteps([""]);
    setError("");
    setCurrentInput("");
    setCurrentStep(0);
    onOpenChange(false);
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!currentInput.trim()) {
        setError("Le titre est requis");
        return;
      }
      
      if (existingItems.some(item => item.title.toLowerCase() === currentInput.toLowerCase())) {
        setError("Une étape avec ce titre existe déjà");
        return;
      }
      
      setTitle(currentInput);
      setCurrentInput("");
      setError("");
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setDescription(currentInput);
      setCurrentInput("");
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (currentInput.trim()) {
        setSteps(prev => [...prev.filter(s => s.trim() !== ""), currentInput.trim()]);
        setCurrentInput("");
      } else {
        finalizeItem();
      }
    }
  };

  const finalizeItem = () => {
    // Create new item
    const filteredSteps = steps.filter(step => step.trim() !== "");
    
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "Étape personnalisée",
      completed: false,
      custom: true,
      steps: filteredSteps
    };
    
    // Add item and close dialog
    onAddItem(newItem);
    toast({
      title: "Étape ajoutée",
      description: `"${title}" a été ajouté à votre feuille de route`,
    });
    resetAndClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNextStep();
    }
  };

  const getPromptText = () => {
    switch (currentStep) {
      case 0:
        return "Quel est le titre de cette nouvelle étape?";
      case 1:
        return "Ajoutez une description (optionnelle):";
      case 2:
        return "Ajoutez des sous-étapes (une par une) ou envoyez vide pour terminer:";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-[#5C4E3D]">Ajouter une étape</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          {/* Chat-like history display */}
          <div className="flex flex-col space-y-4 max-h-[300px] overflow-y-auto py-2">
            {/* System prompts and user responses */}
            <div className="bg-[#F8F7FD] p-3 rounded-lg text-[#454240] text-sm inline-block max-w-[80%]">
              {getPromptText()}
            </div>
            
            {currentStep > 0 && (
              <>
                <div className="bg-[#B88E23]/10 p-3 rounded-lg text-[#5C4E3D] text-sm self-end max-w-[80%]">
                  {title}
                </div>
                
                <div className="bg-[#F8F7FD] p-3 rounded-lg text-[#454240] text-sm inline-block max-w-[80%]">
                  Ajoutez une description (optionnelle):
                </div>
              </>
            )}
            
            {currentStep > 1 && (
              <>
                <div className="bg-[#B88E23]/10 p-3 rounded-lg text-[#5C4E3D] text-sm self-end max-w-[80%]">
                  {description || "(Pas de description)"}
                </div>
                
                <div className="bg-[#F8F7FD] p-3 rounded-lg text-[#454240] text-sm inline-block max-w-[80%]">
                  Ajoutez des sous-étapes (une par une) ou envoyez vide pour terminer:
                </div>
              </>
            )}
            
            {currentStep === 2 && steps.filter(s => s.trim() !== "").map((step, idx) => (
              <div key={idx} className="bg-[#B88E23]/10 p-3 rounded-lg text-[#5C4E3D] text-sm self-end max-w-[80%]">
                {step}
              </div>
            ))}
          </div>
          
          {/* Input area */}
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              {currentStep === 2 && (
                <div className="absolute bottom-1 left-2 text-[#B88E23] text-xs">
                  Envoyez vide pour terminer
                </div>
              )}
              <Textarea
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyPress}
                placeholder="Écrivez ici..."
                className="min-h-[60px] pr-10 pt-2 border-[#B88E23]/20 focus:border-[#B88E23] focus-visible:ring-[#B88E23]/30"
              />
              <Button
                type="button"
                onClick={handleNextStep}
                className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full bg-transparent hover:bg-[#B88E23]/10 text-[#B88E23]"
              >
                <Send size={18} />
                <span className="sr-only">Envoyer</span>
              </Button>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-xs">{error}</p>}
          
          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="border-[#B88E23]/20"
            >
              Annuler
            </Button>
            
            {currentStep === 2 && steps.some(s => s.trim() !== "") && (
              <Button
                type="button"
                onClick={finalizeItem}
                className="bg-[#B88E23] hover:bg-[#B88E23]/90 text-white"
              >
                Terminer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddChecklistItemDialog;
