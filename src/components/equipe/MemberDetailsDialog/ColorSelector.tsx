
import React from "react";
import { Label } from "@/components/ui/label";

interface ColorSelectorProps {
  selectedColor: string;
  onChange: (colorId: string) => void;
}

const colors = [
  { id: "blue", value: "#1a73e8" },
  { id: "red", value: "#e53935" },
  { id: "green", value: "#43a047" },
  { id: "purple", value: "#8e24aa" },
  { id: "yellow", value: "#f9a825" },
  { id: "teal", value: "#00897b" },
  { id: "orange", value: "#ef6c00" },
  { id: "pink", value: "#d81b60" },
  { id: "cyan", value: "#00acc1" },
  { id: "brown", value: "#6d4c41" },
];

const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onChange }) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Couleur d'identification</Label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onChange(color.id)}
            className={`w-6 h-6 rounded-full border-2 ${selectedColor === color.id ? 'border-gray-800' : 'border-transparent'}`}
            style={{ backgroundColor: color.value }}
            aria-label={`Couleur ${color.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
