
import React from "react";
import { ThemeLayout, useTheme } from "@/contexts/ThemeContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LayoutSelectionProps {
  selectedLayout: ThemeLayout;
  onLayoutSelect: (layout: ThemeLayout) => void;
}

const LayoutSelection: React.FC<LayoutSelectionProps> = ({ 
  selectedLayout, 
  onLayoutSelect 
}) => {
  const layoutOptions: ThemeLayout[] = ['grid', 'masonry', 'carousel'];
  
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-3">Gallery Layout</h3>
      <RadioGroup 
        value={selectedLayout} 
        onValueChange={(value) => onLayoutSelect(value as ThemeLayout)} 
        className="flex flex-col gap-3"
      >
        {layoutOptions.map((layoutOption) => (
          <div key={layoutOption} className="flex items-center space-x-2">
            <RadioGroupItem value={layoutOption} id={`layout-${layoutOption}`} />
            <Label htmlFor={`layout-${layoutOption}`} className="capitalize">{layoutOption}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default LayoutSelection;
