
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExpirationBannerProps {
  expirationDate: string;
  onExtend: () => void;
}

const ExpirationBanner: React.FC<ExpirationBannerProps> = ({ expirationDate, onExtend }) => {
  const formattedDate = format(parseISO(expirationDate), 'MMMM dd, yyyy');
  
  return (
    <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 flex items-center justify-between">
      <div className="flex items-center">
        <Calendar className="h-5 w-5 text-amber-500 mr-2" />
        <span className="text-amber-800 dark:text-amber-200">
          Your gallery access expires on <strong>{formattedDate}</strong>
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={onExtend}>
        Extend Access
      </Button>
    </div>
  );
};

export default ExpirationBanner;
