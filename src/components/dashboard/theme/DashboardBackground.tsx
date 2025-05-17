
import React from "react";
import { useBackgroundImage } from "@/hooks/use-background-image";

interface DashboardBackgroundProps {
  children: React.ReactNode;
}

const DashboardBackground: React.FC<DashboardBackgroundProps> = ({ children }) => {
  const { backgroundImage, isLoading } = useBackgroundImage();

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {backgroundImage.url && (
        <div 
          className="absolute inset-0 z-0" 
          style={{ 
            backgroundImage: `url(${backgroundImage.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: 0.15
          }}
        />
      )}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default DashboardBackground;
