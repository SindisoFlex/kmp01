
import React, { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Download, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  MediaVisibility, 
  ServiceCategory, 
  mockGalleries, 
  mockMediaItems,
  GalleryCollection,
  MediaItem
} from "@/utils/galleryUtils";
import GalleryCollectionCard from "@/components/gallery/GalleryCollection";
import MediaCard from "@/components/gallery/MediaCard";
import ExpirationBanner from "@/components/gallery/ExpirationBanner";

const DashboardGallery: React.FC = () => {
  const { user } = useAuth();
  const { color, layout } = useTheme();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [galleries, setGalleries] = useState<GalleryCollection[]>(mockGalleries);
  const params = useParams();
  const galleryId = params.galleryId;
  
  // For a specific gallery view
  const [mediaItems, setMediaItems] = useState<{[key: string]: MediaItem[]}>(() => {
    // Deep clone the mock media items
    return JSON.parse(JSON.stringify(mockMediaItems));
  });
  
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  
  if (!user) return null;
  
  // If galleryId is provided, show the specific gallery detail view
  if (galleryId) {
    const gallery = galleries.find(g => g.id === galleryId);
    
    // If gallery not found, redirect to main gallery page
    if (!gallery) {
      return <Navigate to="/dashboard/gallery" replace />;
    }
    
    const items = mediaItems[galleryId] || [];
    
    const handleVisibilityChange = (itemId: string, newVisibility: MediaVisibility) => {
      setMediaItems(prev => {
        const updatedItems = {...prev};
        
        if (updatedItems[galleryId]) {
          updatedItems[galleryId] = updatedItems[galleryId].map(item => 
            item.id === itemId ? {...item, visibility: newVisibility} : item
          );
        }
        
        return updatedItems;
      });
    };
    
    const handleFavoriteToggle = (itemId: string, isFavorite: boolean) => {
      setMediaItems(prev => {
        const updatedItems = {...prev};
        
        if (updatedItems[galleryId]) {
          updatedItems[galleryId] = updatedItems[galleryId].map(item => 
            item.id === itemId ? {...item, isFavorite} : item
          );
        }
        
        return updatedItems;
      });
    };
    
    const handleExtendExpiration = (newExpirationDate: string) => {
      setGalleries(prev => 
        prev.map(g => 
          g.id === galleryId ? {...g, expirationDate: newExpirationDate} : g
        )
      );
    };
    
    const downloadAll = () => {
      // This would be implemented with a proper download service in a real app
      alert("In a real implementation, this would download all images as a zip file.");
    };
    
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/dashboard/gallery" className="text-sm text-muted-foreground hover:underline mb-1 block">
              ← Back to all galleries
            </Link>
            <h1 className="text-2xl font-bold">{gallery.title}</h1>
            <p className="text-muted-foreground">
              {new Date(gallery.date).toLocaleDateString()} • {items.length} items
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard/gallery-settings">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Link>
            </Button>
            <Button variant="outline" onClick={downloadAll}>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>
        
        <ExpirationBanner 
          expirationDate={gallery.expirationDate} 
          onExtend={handleExtendExpiration} 
        />
        
        <Tabs defaultValue="all" className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All Photos</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item) => (
                  <MediaCard 
                    key={item.id}
                    item={item}
                    onVisibilityChange={handleVisibilityChange}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No photos in this gallery</h3>
                <p className="text-sm text-muted-foreground">
                  This gallery appears to be empty.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-4">
            {items.filter(item => item.isFavorite).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items
                  .filter(item => item.isFavorite)
                  .map((item) => (
                    <MediaCard 
                      key={item.id}
                      item={item}
                      onVisibilityChange={handleVisibilityChange}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No favorites yet</h3>
                <p className="text-sm text-muted-foreground">
                  Click the star icon on any photo to add it to your favorites.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="public" className="mt-4">
            {items.filter(item => item.visibility === 'public').length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items
                  .filter(item => item.visibility === 'public')
                  .map((item) => (
                    <MediaCard 
                      key={item.id}
                      item={item}
                      onVisibilityChange={handleVisibilityChange}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No public photos</h3>
                <p className="text-sm text-muted-foreground">
                  Change the visibility of any photo to make it public.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="private" className="mt-4">
            {items.filter(item => item.visibility === 'private').length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items
                  .filter(item => item.visibility === 'private')
                  .map((item) => (
                    <MediaCard 
                      key={item.id}
                      item={item}
                      onVisibilityChange={handleVisibilityChange}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No private photos</h3>
                <p className="text-sm text-muted-foreground">
                  Change the visibility of any photo to make it private.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // Main gallery collections view (no specific galleryId)
  const filteredGalleries = categoryFilter === 'all' 
    ? galleries 
    : galleries.filter(gallery => gallery.serviceCategory === categoryFilter);
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Galleries</h1>
        <Button variant="outline" asChild>
          <Link to="/dashboard/gallery-settings">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setCategoryFilter('all')}>
            All
          </TabsTrigger>
          <TabsTrigger value="portrait" onClick={() => setCategoryFilter('portrait')}>
            Portrait
          </TabsTrigger>
          <TabsTrigger value="wedding" onClick={() => setCategoryFilter('wedding')}>
            Wedding
          </TabsTrigger>
          <TabsTrigger value="family" onClick={() => setCategoryFilter('family')}>
            Family
          </TabsTrigger>
          <TabsTrigger value="event" onClick={() => setCategoryFilter('event')}>
            Event
          </TabsTrigger>
          <TabsTrigger value="commercial" onClick={() => setCategoryFilter('commercial')}>
            Commercial
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredGalleries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleries.map(gallery => (
                <GalleryCollectionCard key={gallery.id} gallery={gallery} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No galleries available</h3>
              <p className="text-sm text-muted-foreground">
                Your galleries will appear here after your photoshoots.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* We use the same content for all categories, controlled by the filter state */}
        {['portrait', 'wedding', 'family', 'event', 'commercial'].map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            {filteredGalleries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGalleries.map(gallery => (
                  <GalleryCollectionCard key={gallery.id} gallery={gallery} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No {category} galleries available</h3>
                <p className="text-sm text-muted-foreground">
                  Your {category} galleries will appear here after your photoshoots.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DashboardGallery;
