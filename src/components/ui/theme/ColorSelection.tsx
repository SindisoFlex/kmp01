
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeColor, useTheme } from "@/contexts/ThemeContext";

interface ColorSelectionProps {
  selectedColor: ThemeColor;
  onColorSelect: (color: ThemeColor) => void;
}

const ColorSelection: React.FC<ColorSelectionProps> = ({ 
  selectedColor,
  onColorSelect
}) => {
  const themeColors: ThemeColor[] = ['default', 'blue', 'purple', 'green', 'pink', 'orange', 'red'];
  
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-3">Theme Color</h3>
      <div className="flex flex-wrap gap-3">
        {themeColors.map((themeColor) => (
          <Button
            key={themeColor}
            type="button"
            variant={selectedColor === themeColor ? "default" : "outline"}
            className={`w-20 h-10 relative ${themeColor !== 'default' ? `bg-${themeColor}-500 hover:bg-${themeColor}-600` : ''}`}
            onClick={() => onColorSelect(themeColor)}
          >
            {selectedColor === themeColor && (
              <Check className="h-4 w-4 absolute right-2 top-2" />
            )}
            <span className="capitalize">{themeColor}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelection;
