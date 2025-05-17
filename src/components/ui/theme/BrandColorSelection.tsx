
import React from "react";
import { Button } from "@/components/ui/button";
import { BrandColor, useTheme } from "@/contexts/ThemeContext";

interface BrandColorSelectionProps {
  selectedBrandColor: BrandColor;
  onBrandColorSelect: (color: BrandColor) => void;
}

const BrandColorSelection: React.FC<BrandColorSelectionProps> = ({ 
  selectedBrandColor, 
  onBrandColorSelect 
}) => {
  const brandColors: BrandColor[] = ['default', 'black', 'red', 'white'];
  
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-3">Brand Colors</h3>
      <div className="flex flex-wrap gap-3">
        {brandColors.map((color) => (
          <Button
            key={color}
            type="button"
            variant="outline"
            className={`
              w-20 h-10 relative 
              ${color === 'black' ? 'bg-brand-black text-white hover:bg-gray-800' : ''}
              ${color === 'red' ? 'bg-brand-red text-white hover:bg-red-600' : ''}
              ${color === 'white' ? 'bg-white text-black border-gray-200 hover:bg-gray-100' : ''}
              ${selectedBrandColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}
            `}
            onClick={() => onBrandColorSelect(color)}
          >
            <span className="capitalize">{color}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BrandColorSelection;
