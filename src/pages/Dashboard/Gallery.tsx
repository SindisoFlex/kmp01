
import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import GalleryCollection from '@/components/gallery/GalleryCollection';
import ExpirationBanner from '@/components/gallery/ExpirationBanner';
import VisibilityToggle from '@/components/gallery/VisibilityToggle';
import { mockGalleries } from '@/utils/galleryUtils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range";
import { Calendar } from "lucide-react";

const Gallery: React.FC = () => {
  const { user } = useAuth();
  const [galleries, setGalleries] = useState(mockGalleries);
  const [isPublic, setIsPublic] = useState(true);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);

  const handleVisibilityChange = (newVisibility: boolean) => {
    setIsPublic(newVisibility);
  };

  const handleExpirationDateChange = (date: Date | undefined) => {
    setExpirationDate(date);
  };

  const handleExtend = () => {
    // This is a placeholder for the extend functionality
    console.log("Extend gallery access");
  };

  return (
    <div className="container max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">My Gallery</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gallery Settings</CardTitle>
          <CardDescription>Manage the visibility and expiration of your galleries.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public">Public Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your gallery visible to everyone.
              </p>
            </div>
            <VisibilityToggle isPublic={isPublic} onChange={handleVisibilityChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration Date</Label>
            <p className="text-sm text-muted-foreground">
              Set a date for your gallery to expire. After this date, the gallery will no longer be accessible.
            </p>
            <CalendarDateRangePicker date={expirationDate} onDateChange={handleExpirationDateChange} />
          </div>
        </CardContent>
      </Card>

      {expirationDate && (
        <ExpirationBanner 
          expirationDate={expirationDate.toISOString()} 
          onExtend={handleExtend}
        />
      )}

      <GalleryCollection collections={galleries} />
    </div>
  );
};

export default Gallery;
