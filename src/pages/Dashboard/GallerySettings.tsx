
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Image } from "lucide-react";
import { useTheme, ThemeColor, ThemeLayout } from "@/contexts/ThemeContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const GallerySettings: React.FC = () => {
  const { color, layout, setColor, setLayout, applyTheme } = useTheme();
  
  const colorOptions: { value: ThemeColor; label: string; bgClass: string }[] = [
    { value: 'default', label: 'Default', bgClass: 'bg-primary' },
    { value: 'blue', label: 'Ocean Blue', bgClass: 'bg-blue-500' },
    { value: 'purple', label: 'Royal Purple', bgClass: 'bg-purple-500' },
    { value: 'green', label: 'Forest Green', bgClass: 'bg-green-500' },
    { value: 'pink', label: 'Soft Pink', bgClass: 'bg-pink-500' },
    { value: 'orange', label: 'Sunset Orange', bgClass: 'bg-orange-500' }
  ];

  const layoutOptions: { value: ThemeLayout; label: string; description: string }[] = [
    { 
      value: 'grid', 
      label: 'Grid', 
      description: 'Traditional grid layout with equal-sized photos'
    },
    { 
      value: 'masonry', 
      label: 'Masonry', 
      description: 'Pinterest-style layout that preserves image ratios'
    },
    { 
      value: 'carousel', 
      label: 'Carousel', 
      description: 'Horizontal sliding galleries for each session'
    }
  ];
  
  // Sample photos for preview
  const samplePhotos = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=600&q=80"
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gallery Customization</h1>
        <Button onClick={applyTheme}>Save Changes</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Color Theme</CardTitle>
                <CardDescription>Choose a color palette for your gallery</CardDescription>
              </div>
              <Palette className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={color} 
              onValueChange={(value) => setColor(value as ThemeColor)}
              className="grid grid-cols-2 gap-4"
            >
              {colorOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`color-${option.value}`} />
                  <Label 
                    htmlFor={`color-${option.value}`}
                    className="flex items-center"
                  >
                    <span className={`w-4 h-4 rounded-full ${option.bgClass} mr-2`} />
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Layout Style</CardTitle>
                <CardDescription>Set how your photos are displayed</CardDescription>
              </div>
              <Image className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={layout} 
              onValueChange={(value) => setLayout(value as ThemeLayout)}
              className="space-y-4"
            >
              {layoutOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-accent">
                  <RadioGroupItem value={option.value} id={`layout-${option.value}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`layout-${option.value}`} className="font-medium">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gallery Preview</CardTitle>
          <CardDescription>See how your gallery will look with the selected theme</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="desktop" className="mb-4">
            <TabsList>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className={`border p-4 rounded-lg ${color === 'default' ? '' : `border-${color}-200 bg-${color}-50 bg-opacity-10`}`}>
            <h3 className="text-lg font-medium mb-4">Portrait Session - May 2025</h3>
            
            {layout === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {samplePhotos.map((photo, i) => (
                  <div key={i} className="overflow-hidden rounded-md border">
                    <AspectRatio ratio={1 / 1}>
                      <img 
                        src={photo} 
                        alt={`Sample ${i+1}`} 
                        className={`h-full w-full object-cover transition-all hover:scale-105 ${color !== 'default' ? `hover:shadow-${color}-200` : ''}`} 
                      />
                    </AspectRatio>
                  </div>
                ))}
              </div>
            )}
            
            {layout === 'masonry' && (
              <div className="columns-2 sm:columns-4 gap-2">
                {samplePhotos.map((photo, i) => (
                  <div key={i} className="break-inside-avoid mb-2">
                    <img 
                      src={photo} 
                      alt={`Sample ${i+1}`} 
                      className={`w-full rounded-md border transition-all hover:shadow-md ${color !== 'default' ? `hover:shadow-${color}-200` : ''}`} 
                    />
                  </div>
                ))}
              </div>
            )}
            
            {layout === 'carousel' && (
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {samplePhotos.map((photo, i) => (
                  <div key={i} className="flex-none w-52">
                    <AspectRatio ratio={3 / 4}>
                      <img 
                        src={photo} 
                        alt={`Sample ${i+1}`} 
                        className={`h-full w-full rounded-md object-cover border ${color !== 'default' ? `hover:border-${color}-400` : ''}`} 
                      />
                    </AspectRatio>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Note: Actual gallery appearance may vary slightly based on your photos.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GallerySettings;
