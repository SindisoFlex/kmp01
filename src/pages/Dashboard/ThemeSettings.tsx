
import React from "react";
import { useNavigate } from "react-router-dom";
import ThemeManager from "@/components/dashboard/theme/ThemeManager";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeSettings: React.FC = () => {
  const navigate = useNavigate();
  const { playSound } = useTheme();

  return (
    <div className="page-container py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            playSound("click");
            navigate(-1);
          }}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Theme Settings</h1>
      </div>
      
      <div className="flex justify-center">
        <ThemeManager />
      </div>
    </div>
  );
};

export default ThemeSettings;
