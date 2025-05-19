
import React from 'react';
import { Card } from "@/components/ui/card";
import { GalleryCollection as GalleryCollectionType } from '@/utils/galleryUtils';

export interface GalleryCollectionProps {
  collections: GalleryCollectionType[];
  onSelect?: (id: string) => void;
}

const GalleryCollection: React.FC<GalleryCollectionProps> = ({ collections, onSelect }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Card 
          key={collection.id} 
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect && onSelect(collection.id)}
        >
          <div className="p-4">
            <h3 className="font-medium">{collection.title}</h3>
            <p className="text-sm text-muted-foreground">{collection.description}</p>
            <div className="text-xs text-muted-foreground mt-2">
              {collection.photoCount} photos • {collection.date}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GalleryCollection;
