
import { useState, useEffect } from "react";

type BackgroundImage = {
  url: string;
  type: "default" | "custom";
};

export const DEFAULT_BACKGROUNDS = [
  {
    url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    name: "Workspace",
    type: "default"
  },
  {
    url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    name: "Computer",
    type: "default"
  },
  {
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    name: "Mountains",
    type: "default"
  },
  {
    url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
    name: "Night Sky",
    type: "default"
  }
];

export const useBackgroundImage = () => {
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage>({
    url: "",
    type: "default"
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load background image from localStorage on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem("dashboardBackground");
    
    if (savedBackground) {
      try {
        const parsed = JSON.parse(savedBackground);
        setBackgroundImage(parsed);
      } catch (error) {
        console.error("Error parsing background image data:", error);
        // Set default if parsing fails
        setBackgroundImage({
          url: DEFAULT_BACKGROUNDS[0].url,
          type: "default"
        });
      }
    } else {
      // Set default background if none saved
      setBackgroundImage({
        url: DEFAULT_BACKGROUNDS[0].url,
        type: "default" 
      });
    }
    
    setIsLoading(false);
  }, []);

  // Save background image to localStorage when changed
  useEffect(() => {
    if (!isLoading && backgroundImage.url) {
      localStorage.setItem("dashboardBackground", JSON.stringify(backgroundImage));
    }
  }, [backgroundImage, isLoading]);

  // Function to update background image
  const updateBackgroundImage = (newBackground: BackgroundImage) => {
    setBackgroundImage(newBackground);
  };

  // Function to upload custom background
  const uploadCustomBackground = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("File must be an image"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result.toString();
          updateBackgroundImage({
            url: dataUrl,
            type: "custom"
          });
          resolve(dataUrl);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  return {
    backgroundImage,
    updateBackgroundImage,
    uploadCustomBackground,
    isLoading
  };
};
