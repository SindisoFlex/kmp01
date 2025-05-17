
import { useEffect } from "react";

// Function to preload images
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
};

// Function to preload audio
const preloadAudio = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => reject();
    audio.src = src;
  });
};

// Types of resources to preload
export type PreloadResourceType = 'image' | 'audio';

// Resource interface
interface PreloadResource {
  url: string;
  type: PreloadResourceType;
}

// Hook to preload resources
export const usePreload = (resources: PreloadResource[]) => {
  useEffect(() => {
    const preloadResources = async () => {
      try {
        const promises = resources.map((resource) => {
          if (resource.type === 'image') {
            return preloadImage(resource.url);
          } else if (resource.type === 'audio') {
            return preloadAudio(resource.url);
          }
          return Promise.resolve();
        });

        await Promise.all(promises);
        console.log('All resources preloaded successfully');
      } catch (error) {
        console.error('Failed to preload some resources', error);
      }
    };

    preloadResources();
  }, [resources]);
};

// Common resources that should be preloaded
export const COMMON_RESOURCES: PreloadResource[] = [
  { url: '/sounds/click.mp3', type: 'audio' },
  { url: '/sounds/success.mp3', type: 'audio' },
  { url: '/sounds/error.mp3', type: 'audio' },
  { url: '/sounds/notification.mp3', type: 'audio' },
];

// Function to use in App.tsx to preload essential resources
export const usePreloadEssentials = () => {
  usePreload(COMMON_RESOURCES);
};
