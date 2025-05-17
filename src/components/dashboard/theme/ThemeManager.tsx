
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useBackgroundImage, DEFAULT_BACKGROUNDS } from "@/hooks/use-background-image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Upload, RefreshCw, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ThemeManager: React.FC = () => {
  const { playSound } = useTheme();
  const { backgroundImage, updateBackgroundImage, uploadCustomBackground } = useBackgroundImage();
  const [selectedBackground, setSelectedBackground] = useState<string | null>(backgroundImage.url);
  const [isUploading, setIsUploading] = useState(false);

  const handleBackgroundSelect = (url: string) => {
    playSound("click");
    setSelectedBackground(url);
    updateBackgroundImage({
      url,
      type: "default"
    });
    toast({
      title: "Background Updated",
      description: "Your dashboard background has been updated."
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image less than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      playSound("click");
      await uploadCustomBackground(file);
      setSelectedBackground(URL.createObjectURL(file));
      toast({
        title: "Background Uploaded",
        description: "Your custom background has been applied."
      });
      playSound("success");
    } catch (error) {
      console.error("Error uploading background:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your background image.",
        variant: "destructive"
      });
      playSound("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Dashboard Appearance</CardTitle>
        <CardDescription>Customize your dashboard theme and background</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="backgrounds">
          <TabsList className="mb-4">
            <TabsTrigger value="backgrounds" onClick={() => playSound("click")}>
              Backgrounds
            </TabsTrigger>
            <TabsTrigger value="theme-mode" onClick={() => playSound("click")}>
              Theme Mode
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="backgrounds" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Default Backgrounds</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DEFAULT_BACKGROUNDS.map((bg, index) => (
                  <div
                    key={index}
                    onClick={() => handleBackgroundSelect(bg.url)}
                    className={`relative cursor-pointer rounded-md overflow-hidden h-24 border-2 transition-all ${
                      selectedBackground === bg.url ? "border-primary ring-2 ring-primary/50" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={bg.url}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {selectedBackground === bg.url && (
                      <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Custom Background</h3>
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById("bg-upload")?.click()}
                  disabled={isUploading}
                  className="w-full p-8 border-dashed flex flex-col items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={24} className="mb-2 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="mb-2" />
                      <span>Upload custom background (max 5MB)</span>
                    </>
                  )}
                </Button>
                <input
                  id="bg-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended resolution: 1920×1080 or higher
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="theme-mode">
            <div className="flex flex-col md:flex-row gap-4">
              <div 
                className="flex-1 rounded-lg border p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  playSound("click");
                  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  document.documentElement.classList.remove("dark");
                  localStorage.setItem("theme", "light");
                  toast({
                    title: "Light Mode Enabled",
                    description: "Your dashboard is now using light mode"
                  });
                }}
              >
                <div className="p-2 rounded-full bg-primary/10 inline-block mb-2">
                  <Sun className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-1">Light Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Better for daytime viewing with lighter colors and backgrounds
                </p>
              </div>
              
              <div 
                className="flex-1 rounded-lg border p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  playSound("click");
                  document.documentElement.classList.add("dark");
                  localStorage.setItem("theme", "dark");
                  toast({
                    title: "Dark Mode Enabled",
                    description: "Your dashboard is now using dark mode"
                  });
                }}
              >
                <div className="p-2 rounded-full bg-primary/10 inline-block mb-2">
                  <Moon className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-1">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Easier on the eyes in low-light environments
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Theme preferences are saved automatically and will be restored when you return
        </p>
      </CardFooter>
    </Card>
  );
};

export default ThemeManager;
