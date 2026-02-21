import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GalleryCollection from "@/components/gallery/GalleryCollection";
import ExpirationBanner from "@/components/gallery/ExpirationBanner";
import VisibilityToggle from "@/components/gallery/VisibilityToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range";
import type { GalleryCollection as GalleryCollectionType } from "@/utils/galleryUtils";
import { getUserGalleryCollections } from "@/services/galleryService";

const Gallery: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [galleries, setGalleries] = useState<GalleryCollectionType[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [isExtending, setIsExtending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadGalleries = useCallback(async () => {
    if (!user?.id) {
      setGalleries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const rows = await getUserGalleryCollections(user.id);
      setGalleries(rows ?? []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setErrorMessage(`Unable to load gallery content. Please refresh and try again. (${message})`);
      setGalleries([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  const handleVisibilityChange = (newVisibility: boolean) => {
    setIsPublic(newVisibility);
    toast({
      title: "Visibility Updated",
      description: `Your gallery is now ${newVisibility ? "public" : "private"}.`,
    });
  };

  const handleExpirationDateChange = (date: Date | undefined) => {
    setExpirationDate(date);
    toast({
      title: "Expiration Updated",
      description: date ? `Gallery access will expire on ${date.toLocaleDateString()}.` : "Expiration date removed.",
    });
  };

  const handleExtend = async () => {
    setIsExtending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsExtending(false);
    toast({
      title: "Access Extended",
      description: "Gallery access has been extended by 30 days.",
    });
  };

  return (
    <div className="container max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">My Gallery</h1>

      {!user && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
          You are not signed in. Gallery data may be limited.
        </div>
      )}

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
          isLoading={isExtending}
        />
      )}

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading gallery...</div>
      ) : galleries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-medium">No gallery items yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Your photos will appear here after your first completed booking.</p>
            <Button variant="outline" className="mt-4" onClick={loadGalleries}>Refresh</Button>
          </CardContent>
        </Card>
      ) : (
        <GalleryCollection collections={galleries} />
      )}
    </div>
  );
};

export default Gallery;
