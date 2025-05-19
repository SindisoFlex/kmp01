
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface VisibilityToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  // Allow additional props like visibility for MediaCard
  [key: string]: any;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ isPublic, onChange, ...props }) => {
  return (
    <div className="flex items-center space-x-2" {...props}>
      <Switch
        id="public-visibility"
        checked={isPublic}
        onCheckedChange={onChange}
      />
      <Label htmlFor="public-visibility" className="text-sm">
        {isPublic ? 'Public' : 'Private'}
      </Label>
    </div>
  );
};

export default VisibilityToggle;
