
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";
import { MediaVisibility, toggleVisibility } from "@/utils/galleryUtils";
import { toast } from "@/hooks/use-toast";

interface VisibilityToggleProps {
  visibility: MediaVisibility;
  onToggle: (newVisibility: MediaVisibility) => void;
  disabled?: boolean;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ 
  visibility, 
  onToggle,
  disabled = false
}) => {
  const handleToggle = () => {
    const newVisibility = toggleVisibility(visibility);
    onToggle(newVisibility);
    
    toast({
      title: "Visibility Updated",
      description: `This item is now ${newVisibility}.`,
      variant: "default",
    });
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="visibility-toggle"
        checked={visibility === 'public'}
        onCheckedChange={handleToggle}
        disabled={disabled}
      />
      <Label 
        htmlFor="visibility-toggle" 
        className="cursor-pointer flex items-center gap-1 text-sm"
      >
        {visibility === 'public' ? (
          <>
            <Eye className="h-4 w-4" /> Public
          </>
        ) : (
          <>
            <EyeOff className="h-4 w-4" /> Private
          </>
        )}
      </Label>
    </div>
  );
};

export default VisibilityToggle;
