
import React from 'react';
import { Card } from "@/components/ui/card";
import { GalleryCollection as GalleryCollectionType } from '@/utils/galleryUtils';

export interface GalleryCollectionProps {
  collections: GalleryCollectionType[];
  onSelect?: (id: string) => void;
}

const GalleryCollection: React.FC<GalleryCollectionProps> = ({ collections, onSelect }) => {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Card 
          key={collection.id} 
          className="card-dashboard cursor-pointer hover:shadow-md transition-all duration-200"
          onClick={() => onSelect && onSelect(collection.id)}
        >
          <div className="card-content-dashboard">
            <h3 className="font-medium truncate mb-1">{collection.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 overflow-fix">{collection.description}</p>
            <div className="text-xs text-muted-foreground mt-2">
              {/* Display item count and date safely with optional chaining */}
              {(collection.itemCount || 0)} photos • {collection.date}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GalleryCollection;
