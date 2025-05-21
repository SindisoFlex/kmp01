
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MediaVisibility } from '@/utils/galleryUtils';

export interface VisibilityToggleProps {
  isPublic?: boolean;
  onChange?: (isPublic: boolean) => void;
  visibility?: MediaVisibility;
  onToggle?: (newVisibility: 'public' | 'private') => void;
  // Allow additional props like visibility for MediaCard
  [key: string]: any;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ 
  isPublic, 
  onChange, 
  visibility, 
  onToggle, 
  ...props 
}) => {
  // Determine if the item is public based on either prop
  const isItemPublic = isPublic !== undefined ? isPublic : visibility === 'public';
  
  // Handle change based on which props were provided
  const handleChange = (value: boolean) => {
    if (onChange) {
      onChange(value);
    }
    if (onToggle) {
      onToggle(value ? 'public' : 'private');
    }
  };

  return (
    <div className="flex items-center space-x-2" {...props}>
      <Switch
        id="public-visibility"
        checked={isItemPublic}
        onCheckedChange={handleChange}
      />
      <Label htmlFor="public-visibility" className="text-sm">
        {isItemPublic ? 'Public' : 'Private'}
      </Label>
    </div>
  );
};

export default VisibilityToggle;
