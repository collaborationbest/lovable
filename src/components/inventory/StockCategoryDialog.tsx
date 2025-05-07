
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryCategory } from "@/types/Inventory";
import { Save, Tag } from "lucide-react";

interface StockCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Omit<InventoryCategory, 'id'>) => void;
}

const PREDEFINED_COLORS = [
  "#B88E23", // Gold (primary)
  "#3B82F6", // Blue
  "#10B981", // Green
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6B7280", // Gray
];

const StockCategoryDialog: React.FC<StockCategoryDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<InventoryCategory, 'id'>>({
    name: '',
    color: PREDEFINED_COLORS[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleColorSelect = (color: string) => {
    setFormData({
      ...formData,
      color,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.color) {
      return;
    }
    
    onSave(formData);
    setFormData({
      name: '',
      color: PREDEFINED_COLORS[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2 text-[#B88E23]" />
            Ajouter une catégorie
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#5C4E3D]">
              Nom de la catégorie *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border-[#B88E23]/30"
              placeholder="Ex: Implants, Consommables, Instruments..."
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#5C4E3D]">
              Couleur *
            </Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-[#B88E23]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
            <Input
              id="color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full h-10 p-1 border-[#B88E23]/30 mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#B88E23]/30"
            >
              Annuler
            </Button>
            <Button type="submit" className="bg-[#B88E23] hover:bg-[#A17D1F]">
              <Save className="h-4 w-4 mr-1" /> Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockCategoryDialog;
