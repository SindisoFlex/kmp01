
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Check } from "lucide-react";
import { MediaVisibility, ServiceCategory } from "@/utils/galleryUtils";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const GallerySettings: React.FC = () => {
  const { color, layout, setColor, setLayout, applyTheme } = useTheme();
  const [defaultVisibility, setDefaultVisibility] = useState<MediaVisibility>('private');
  const [autoExpiration, setAutoExpiration] = useState(true);
  const [compressDownloads, setCompressDownloads] = useState(true);
  const [defaultWatermark, setDefaultWatermark] = useState(false);
  const [preferredCategory, setPreferredCategory] = useState<ServiceCategory>('portrait');
  
  const handleSaveSettings = () => {
    // In a real app, this would save settings to a database
    applyTheme();
    
    // Simulating saving other settings
    localStorage.setItem('defaultVisibility', defaultVisibility);
    localStorage.setItem('autoExpiration', String(autoExpiration));
    localStorage.setItem('compressDownloads', String(compressDownloads));
    localStorage.setItem('defaultWatermark', String(defaultWatermark));
    localStorage.setItem('preferredCategory', preferredCategory);
    
    toast({
      title: "Settings Saved",
      description: "Your gallery preferences have been updated.",
    });
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard/gallery" className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
        <h1 className="text-2xl font-bold">Gallery Settings</h1>
        <p className="text-muted-foreground">
          Customize how your photo galleries appear and function.
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance & Layout</CardTitle>
            <CardDescription>
              Choose how your gallery looks and feels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Color Theme</h3>
                <RadioGroup 
                  defaultValue={color} 
                  value={color}
                  onValueChange={(val) => setColor(val as any)} 
                  className="flex flex-wrap gap-3"
                >
                  {['default', 'blue', 'green', 'purple', 'pink', 'orange'].map((c) => (
                    <div key={c} className="flex items-center space-x-2">
                      <RadioGroupItem value={c} id={`color-${c}`} />
                      <Label htmlFor={`color-${c}`} className="capitalize">{c}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Layout Style</h3>
                <RadioGroup 
                  defaultValue={layout} 
                  value={layout}
                  onValueChange={(val) => setLayout(val as any)} 
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grid" id="layout-grid" />
                    <Label htmlFor="layout-grid">Grid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masonry" id="layout-masonry" />
                    <Label htmlFor="layout-masonry">Masonry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="carousel" id="layout-carousel" />
                    <Label htmlFor="layout-carousel">Carousel</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Default Settings</CardTitle>
            <CardDescription>
              Set your preferences for all new galleries and uploads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="default-visibility" className="text-sm font-medium">Default Visibility</Label>
                  <p className="text-xs text-muted-foreground">Choose whether new uploads are private or public by default.</p>
                </div>
                <Select 
                  value={defaultVisibility}
                  onValueChange={(val) => setDefaultVisibility(val as MediaVisibility)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Visibility</SelectLabel>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="preferred-category" className="text-sm font-medium">Preferred Category</Label>
                  <p className="text-xs text-muted-foreground">Your default gallery category.</p>
                </div>
                <Select 
                  value={preferredCategory}
                  onValueChange={(val) => setPreferredCategory(val as ServiceCategory)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-expiration" className="text-sm font-medium">Automatic Expiration</Label>
                  <p className="text-xs text-muted-foreground">Galleries will expire after 24 months unless extended.</p>
                </div>
                <Switch 
                  id="auto-expiration" 
                  checked={autoExpiration}
                  onCheckedChange={setAutoExpiration}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compress-downloads" className="text-sm font-medium">Compress Downloads</Label>
                  <p className="text-xs text-muted-foreground">Automatically compress images when downloading multiple files.</p>
                </div>
                <Switch 
                  id="compress-downloads" 
                  checked={compressDownloads}
                  onCheckedChange={setCompressDownloads}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="default-watermark" className="text-sm font-medium">Default Watermark</Label>
                  <p className="text-xs text-muted-foreground">Apply watermark to public images automatically.</p>
                </div>
                <Switch 
                  id="default-watermark" 
                  checked={defaultWatermark}
                  onCheckedChange={setDefaultWatermark}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Gallery Expiration</CardTitle>
            <CardDescription>
              Manage your gallery expiration settings. Galleries expire after 24 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm">
              Your galleries will expire after 24 months from the date they were created. You can extend the availability of your galleries for R100 per year.
            </p>
            <p className="text-sm text-muted-foreground">
              Expired galleries can be renewed within 30 days of expiration. After that period, they may be permanently deleted.
            </p>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard/gallery">Cancel</Link>
          </Button>
          <Button onClick={handleSaveSettings}>
            <Check className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GallerySettings;
