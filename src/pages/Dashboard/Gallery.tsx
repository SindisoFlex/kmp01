
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Download, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useTheme } from "@/contexts/ThemeContext";

// Mock data for gallery
const mockSessions = [
  {
    id: 1,
    title: "Spring Portrait Session",
    date: "May 2, 2025",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=600&q=80"
    ]
  },
  {
    id: 2, 
    title: "Family Gathering",
    date: "April 15, 2025",
    photos: [
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      "https://images.unsplash.com/photo-1518049362265-d5b2a6b00b37?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=600&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      "https://images.unsplash.com/photo-1513279922550-250c2129b13a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80"
    ]
  }
];

const DashboardGallery: React.FC = () => {
  const { user } = useAuth();
  const { color, layout } = useTheme();
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (photoUrl: string) => {
    if (favorites.includes(photoUrl)) {
      setFavorites(favorites.filter(url => url !== photoUrl));
    } else {
      setFavorites([...favorites, photoUrl]);
    }
  };

  if (!user) return null;
  
  const renderGalleryWithTheme = (photos: string[]) => {
    switch (layout) {
      case 'masonry':
        return (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="break-inside-avoid mb-2 relative group">
                <img 
                  src={photo} 
                  alt={`Photo ${i+1}`} 
                  className={`w-full rounded-md hover:shadow-md transition-all ${
                    color !== 'default' ? `hover:shadow-${color}-200` : ''
                  }`} 
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleFavorite(photo)}
                >
                  <Star 
                    className={`h-5 w-5 ${favorites.includes(photo) ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                  />
                </Button>
              </div>
            ))}
          </div>
        );
        
      case 'carousel':
        return (
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {photos.map((photo, i) => (
              <div key={i} className="flex-none w-60 relative group">
                <AspectRatio ratio={3 / 4}>
                  <img 
                    src={photo} 
                    alt={`Photo ${i+1}`} 
                    className={`h-full w-full rounded-md object-cover border ${
                      color !== 'default' ? `hover:border-${color}-400` : ''
                    }`} 
                  />
                </AspectRatio>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleFavorite(photo)}
                >
                  <Star 
                    className={`h-5 w-5 ${favorites.includes(photo) ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                  />
                </Button>
              </div>
            ))}
          </div>
        );
        
      case 'grid':
      default:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative group">
                <AspectRatio ratio={1 / 1}>
                  <img 
                    src={photo} 
                    alt={`Photo ${i+1}`} 
                    className={`h-full w-full object-cover rounded-md transition-all hover:scale-105 ${
                      color !== 'default' ? `hover:shadow-${color}-200` : ''
                    }`} 
                  />
                </AspectRatio>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleFavorite(photo)}
                >
                  <Star 
                    className={`h-5 w-5 ${favorites.includes(photo) ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                  />
                </Button>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Photo Gallery</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard/gallery-settings">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Photos</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="sessions">By Session</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {mockSessions.flatMap(session => session.photos).length > 0 ? (
            renderGalleryWithTheme(mockSessions.flatMap(session => session.photos))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No photos yet</h3>
              <p className="text-sm text-muted-foreground">
                Your gallery will populate after your first photoshoot.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-4">
          {favorites.length > 0 ? (
            renderGalleryWithTheme(favorites)
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No favorites yet</h3>
              <p className="text-sm text-muted-foreground">
                Click the star icon on any photo to add it to your favorites.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-4">
          <div className="space-y-8">
            {mockSessions.map(session => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>{session.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{session.date}</p>
                </CardHeader>
                <CardContent>
                  {renderGalleryWithTheme(session.photos)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardGallery;
