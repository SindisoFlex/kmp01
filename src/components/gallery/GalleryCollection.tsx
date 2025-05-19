import React from 'react';
import { Card } from "@/components/ui/card";
import { GalleryCollection as GalleryCollectionType } from '@/utils/galleryUtils';

export interface GalleryCollectionProps {
  collections: GalleryCollectionType[];
}

const GalleryCollection: React.FC<GalleryCollectionProps> = ({ collections }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Card key={collection.id} className="overflow-hidden">
          {/* Collection content here */}
        </Card>
      ))}
    </div>
  );
};

export default GalleryCollection;
