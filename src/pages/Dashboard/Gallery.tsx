
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Download, Filter, Maximize } from "lucide-react";

const DashboardGallery: React.FC = () => {
  // Mock data for gallery
  const photos = [
    { id: 1, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Portrait Session", date: "May 12, 2025" },
    { id: 2, url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Fashion Shoot", date: "April 22, 2025" },
    { id: 3, url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Model Portfolio", date: "April 15, 2025" },
    { id: 4, url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Headshot Session", date: "March 30, 2025" },
    { id: 5, url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Fashion Shoot", date: "March 15, 2025" },
    { id: 6, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Portrait Session", date: "February 28, 2025" },
    { id: 7, url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Portrait Session", date: "February 10, 2025" },
    { id: 8, url: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Lifestyle Shoot", date: "January 22, 2025" },
    { id: 9, url: "https://images.unsplash.com/photo-1528892952291-009c663ce843?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", session: "Headshot Session", date: "January 5, 2025" }
  ];

  const photoGroups = [
    { name: "Portrait Session", count: 3 },
    { name: "Fashion Shoot", count: 2 },
    { name: "Headshot Session", count: 2 },
    { name: "Model Portfolio", count: 1 },
    { name: "Lifestyle Shoot", count: 1 }
  ];

  // State for currently selected photo for viewing (in a real app, this would open a modal)
  const [selectedPhoto, setSelectedPhoto] = React.useState<number | null>(null);

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">My Gallery</h1>
        <p className="text-muted-foreground">Browse and download your photography sessions</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">All Photos</Button>
          <Button variant="outline" size="sm">Recent</Button>
          <Button variant="outline" size="sm">Favorites</Button>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Collections */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>Your photos organized by session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {photoGroups.map((group, index) => (
              <div key={index} className="text-center">
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2 overflow-hidden">
                  <img 
                    src={photos.find(p => p.session === group.name)?.url} 
                    alt={group.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-medium text-sm">{group.name}</p>
                <p className="text-xs text-muted-foreground">{group.count} photos</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Photos</CardTitle>
          <CardDescription>Your complete photo collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative">
                <AspectRatio ratio={1 / 1} className="overflow-hidden rounded-md border">
                  <img 
                    src={photo.url} 
                    alt={`Photo ${photo.id}`}
                    className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedPhoto(photo.id)}>
                        <Maximize className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AspectRatio>
                <div className="mt-2">
                  <p className="text-sm font-medium truncate">{photo.session}</p>
                  <p className="text-xs text-muted-foreground">{photo.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardGallery;
