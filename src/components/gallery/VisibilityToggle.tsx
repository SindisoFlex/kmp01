
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface VisibilityToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ isPublic, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="public-visibility"
        checked={isPublic}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default VisibilityToggle;
