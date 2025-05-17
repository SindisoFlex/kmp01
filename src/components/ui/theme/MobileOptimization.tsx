
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface MobileOptimizationProps {
  isOptimized: boolean;
  onToggleOptimization: (optimized: boolean) => void;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({
  isOptimized,
  onToggleOptimization
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Mobile Optimization</h3>
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="mobile-optimization" className="font-medium">Optimize for mobile</Label>
          <p className="text-sm text-muted-foreground">Enable simplified layouts for small screens</p>
        </div>
        <Switch
          id="mobile-optimization"
          checked={isOptimized}
          onCheckedChange={onToggleOptimization}
        />
      </div>
    </div>
  );
};

export default MobileOptimization;
