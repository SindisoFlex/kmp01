
import React from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SoundPreference } from "@/contexts/ThemeContext";

interface SoundPreferencesProps {
  selectedPreference: SoundPreference;
  onPreferenceChange: (preference: SoundPreference) => void;
}

const SoundPreferences: React.FC<SoundPreferencesProps> = ({ 
  selectedPreference, 
  onPreferenceChange 
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Sound Effects</h3>
      <RadioGroup 
        value={selectedPreference} 
        onValueChange={(value) => onPreferenceChange(value as SoundPreference)} 
        className="flex flex-col gap-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="sound-all" />
          <Label htmlFor="sound-all" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" /> All sounds
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="minimal" id="sound-minimal" />
          <Label htmlFor="sound-minimal" className="flex items-center gap-2">
            <Volume1 className="h-4 w-4" /> Minimal sounds
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="sound-none" />
          <Label htmlFor="sound-none" className="flex items-center gap-2">
            <VolumeX className="h-4 w-4" /> No sounds
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default SoundPreferences;
