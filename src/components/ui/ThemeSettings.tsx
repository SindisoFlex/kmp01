
import React from "react";
import { Check, Smartphone, Volume2, Volume1, VolumeX, Palette, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme, ThemeColor, ThemeLayout, BrandColor, SoundPreference } from "@/contexts/ThemeContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  const themeColors: ThemeColor[] = ['default', 'blue', 'purple', 'green', 'pink', 'orange', 'red'];
  const layoutOptions: ThemeLayout[] = ['grid', 'masonry', 'carousel'];
  const brandColors: BrandColor[] = ['default', 'black', 'red', 'white'];
  const soundOptions: SoundPreference[] = ['all', 'minimal', 'none'];
  
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
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-3">Theme Color</h3>
              <div className="flex flex-wrap gap-3">
                {themeColors.map((themeColor) => (
                  <Button
                    key={themeColor}
                    type="button"
                    variant={color === themeColor ? "default" : "outline"}
                    className={`w-20 h-10 relative ${themeColor !== 'default' ? `bg-${themeColor}-500 hover:bg-${themeColor}-600` : ''}`}
                    onClick={() => handleColorClick(themeColor)}
                  >
                    {color === themeColor && (
                      <Check className="h-4 w-4 absolute right-2 top-2" />
                    )}
                    <span className="capitalize">{themeColor}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Layout Tab */}
          <TabsContent value="layout" className="pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-3">Gallery Layout</h3>
              <RadioGroup value={layout} onValueChange={(value) => handleLayoutClick(value as ThemeLayout)} className="flex flex-col gap-3">
                {layoutOptions.map((layoutOption) => (
                  <div key={layoutOption} className="flex items-center space-x-2">
                    <RadioGroupItem value={layoutOption} id={`layout-${layoutOption}`} />
                    <Label htmlFor={`layout-${layoutOption}`} className="capitalize">{layoutOption}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
          
          {/* Branding Tab */}
          <TabsContent value="branding" className="pt-6">
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
                      ${brandColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}
                    onClick={() => handleBrandColorClick(color)}
                  >
                    <span className="capitalize">{color}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Mobile Optimization</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mobile-optimization" className="font-medium">Optimize for mobile</Label>
                  <p className="text-sm text-muted-foreground">Enable simplified layouts for small screens</p>
                </div>
                <Switch
                  id="mobile-optimization"
                  checked={isMobileOptimized}
                  onCheckedChange={handleOptimizationToggle}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Sound Effects</h3>
              <RadioGroup value={soundPreference} onValueChange={(value) => handleSoundPreferenceChange(value as SoundPreference)} className="flex flex-col gap-3">
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
