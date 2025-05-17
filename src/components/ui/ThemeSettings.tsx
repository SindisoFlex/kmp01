
import React from "react";
import { Palette, LayoutGrid, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme, ThemeColor, ThemeLayout, BrandColor, SoundPreference } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ColorSelection from "./theme/ColorSelection";
import LayoutSelection from "./theme/LayoutSelection";
import BrandColorSelection from "./theme/BrandColorSelection";
import MobileOptimization from "./theme/MobileOptimization";
import SoundPreferences from "./theme/SoundPreferences";

const ThemeSettings: React.FC = () => {
  const { 
    color, 
    layout, 
    brandColor, 
    soundPreference, 
    isMobileOptimized,
    setColor, 
    setLayout, 
    setBrandColor, 
    setSoundPreference, 
    setMobileOptimized,
    applyTheme,
    playSound
  } = useTheme();
  
  const isMobile = useIsMobile();
  
  const handleColorClick = (newColor: ThemeColor) => {
    setColor(newColor);
    playSound('click');
  };
  
  const handleLayoutClick = (newLayout: ThemeLayout) => {
    setLayout(newLayout);
    playSound('click');
  };
  
  const handleBrandColorClick = (newColor: BrandColor) => {
    setBrandColor(newColor);
    playSound('click');
  };
  
  const handleSoundPreferenceChange = (newPreference: SoundPreference) => {
    setSoundPreference(newPreference);
    
    // Play a sound to demonstrate the setting if not 'none'
    if (newPreference !== 'none') {
      playSound('success');
    }
  };
  
  const handleOptimizationToggle = (optimized: boolean) => {
    setMobileOptimized(optimized);
    playSound('click');
  };
  
  const handleApplyTheme = () => {
    applyTheme();
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>Customize the look and feel of your gallery</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors" onClick={() => playSound('click')}>
              <Palette className="mr-2 h-4 w-4" /> 
              <span className={isMobile ? "sr-only" : ""}>Colors</span>
            </TabsTrigger>
            <TabsTrigger value="layout" onClick={() => playSound('click')}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="branding" onClick={() => playSound('click')}>
              <span className="mr-2">🎨</span>
              <span className={isMobile ? "sr-only" : ""}>Branding</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" onClick={() => playSound('click')}>
              <Smartphone className="mr-2 h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Preferences</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Colors Tab */}
          <TabsContent value="colors" className="pt-6">
            <ColorSelection 
              selectedColor={color} 
              onColorSelect={handleColorClick} 
            />
          </TabsContent>
          
          {/* Layout Tab */}
          <TabsContent value="layout" className="pt-6">
            <LayoutSelection 
              selectedLayout={layout}
              onLayoutSelect={handleLayoutClick}
            />
          </TabsContent>
          
          {/* Branding Tab */}
          <TabsContent value="branding" className="pt-6">
            <BrandColorSelection 
              selectedBrandColor={brandColor}
              onBrandColorSelect={handleBrandColorClick}
            />
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="pt-6 space-y-6">
            <MobileOptimization 
              isOptimized={isMobileOptimized}
              onToggleOptimization={handleOptimizationToggle}
            />
            
            <SoundPreferences
              selectedPreference={soundPreference}
              onPreferenceChange={handleSoundPreferenceChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleApplyTheme}>
          Apply Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ThemeSettings;
