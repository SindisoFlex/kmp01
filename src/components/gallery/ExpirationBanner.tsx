
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { daysUntilExpiration, formatExpirationDate, isExpired, extendGalleryExpiration } from "@/utils/galleryUtils";

interface ExpirationBannerProps {
  expirationDate: string;
  onExtend: (newDate: string) => void;
}

const ExpirationBanner: React.FC<ExpirationBannerProps> = ({ expirationDate, onExtend }) => {
  const expired = isExpired(expirationDate);
  const daysLeft = daysUntilExpiration(expirationDate);
  
  const handleExtend = () => {
    const newDate = extendGalleryExpiration(expirationDate, onExtend);
    onExtend(newDate);
  };

  // No banner needed if plenty of time left
  if (!expired && daysLeft > 60) return null;

  return (
    <Alert className={expired ? "bg-red-50 border-red-200" : daysLeft < 30 ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}>
      <AlertTitle className={expired ? "text-red-800" : daysLeft < 30 ? "text-amber-800" : "text-blue-800"}>
        {expired ? "Gallery Expired" : `Gallery Expires Soon - ${daysLeft} days left`}
      </AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {expired ? (
            <span className="text-red-600">This gallery expired on {formatExpirationDate(expirationDate)}. Extend now to regain access.</span>
          ) : (
            <span className={daysLeft < 30 ? "text-amber-600" : "text-blue-600"}>
              Your gallery will expire on {formatExpirationDate(expirationDate)}. Extend now to maintain access.
            </span>
          )}
        </div>
        <Button 
          variant={expired ? "destructive" : daysLeft < 30 ? "default" : "outline"}
          className={expired ? "" : daysLeft < 30 ? "bg-amber-500 hover:bg-amber-600" : ""}
          onClick={handleExtend}
        >
          Extend for R100/year
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ExpirationBanner;
