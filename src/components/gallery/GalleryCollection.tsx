
import React from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatExpirationDate, daysUntilExpiration, GalleryCollection } from "@/utils/galleryUtils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";

interface GalleryCollectionCardProps {
  gallery: GalleryCollection;
}

const GalleryCollectionCard: React.FC<GalleryCollectionCardProps> = ({ gallery }) => {
  const navigate = useNavigate();
  const daysLeft = daysUntilExpiration(gallery.expirationDate);
  
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleViewGallery = () => {
    navigate(`/dashboard/gallery/${gallery.id}`);
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <AspectRatio ratio={4/3}>
          <img
            src={gallery.thumbnailUrl || 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?q=80&w=600&auto=format&fit=crop'}
            alt={gallery.title}
            className="h-full w-full object-cover"
          />
        </AspectRatio>
        <Badge className="absolute top-2 right-2 capitalize">
          {gallery.serviceCategory}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle>{gallery.title}</CardTitle>
        <CardDescription>
          {formatDate(gallery.date)} • {gallery.itemCount} items
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          {gallery.description || `A collection of photos from your ${gallery.serviceCategory} session.`}
        </p>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-0">
        <div className="text-xs text-muted-foreground">
          Expires: {formatExpirationDate(gallery.expirationDate)}
          {daysLeft < 60 && (
            <Badge variant="outline" className={`ml-2 ${daysLeft < 30 ? 'border-amber-200 text-amber-700' : ''}`}>
              {daysLeft} days left
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={handleViewGallery}>View Gallery</Button>
      </CardFooter>
    </Card>
  );
};

export default GalleryCollectionCard;
