
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";

export type ThemeColor = 'default' | 'blue' | 'purple' | 'green' | 'pink' | 'orange' | 'red';
export type ThemeLayout = 'grid' | 'masonry' | 'carousel';
export type BrandColor = 'default' | 'black' | 'red' | 'white';
export type SoundPreference = 'all' | 'minimal' | 'none';

// Define sound URLs
const SOUNDS = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  notification: '/sounds/notification.mp3',
};

interface ThemeContextType {
  color: ThemeColor;
  layout: ThemeLayout;
  brandColor: BrandColor;
  soundPreference: SoundPreference;
  isMobileOptimized: boolean;
  setColor: (color: ThemeColor) => void;
  setLayout: (layout: ThemeLayout) => void;
  setBrandColor: (color: BrandColor) => void;
  setSoundPreference: (preference: SoundPreference) => void;
  setMobileOptimized: (optimized: boolean) => void;
  applyTheme: () => void;
  playSound: (sound: 'click' | 'success' | 'error' | 'notification') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [color, setColor] = useState<ThemeColor>('default');
  const [layout, setLayout] = useState<ThemeLayout>('grid');
  const [brandColor, setBrandColor] = useState<BrandColor>('default');
  const [soundPreference, setSoundPreference] = useState<SoundPreference>('minimal');
  const [isMobileOptimized, setMobileOptimized] = useState<boolean>(true);
  
  // Audio elements for sound effects
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement | null;
  }>({
    click: null,
    success: null,
    error: null,
    notification: null,
  });
  
  // Initialize audio elements
  useEffect(() => {
    const newAudioElements: { [key: string]: HTMLAudioElement } = {
      click: new Audio(SOUNDS.click),
      success: new Audio(SOUNDS.success),
      error: new Audio(SOUNDS.error),
      notification: new Audio(SOUNDS.notification),
    };
    
    // Set volume for all elements
    Object.values(newAudioElements).forEach(audio => {
      if (audio) audio.volume = 0.3;
    });
    
    setAudioElements(newAudioElements);
    
    // Cleanup
    return () => {
      Object.values(newAudioElements).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);
  
  // Play sound function
  const playSound = (sound: 'click' | 'success' | 'error' | 'notification') => {
    if (soundPreference === 'none') return;
    
    // For minimal setting, only play success and error sounds
    if (soundPreference === 'minimal' && (sound === 'click')) return;
    
    const audio = audioElements[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('Error playing sound:', err));
    }
  };
  
  // Load theme settings from localStorage on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor') as ThemeColor | null;
    const savedLayout = localStorage.getItem('themeLayout') as ThemeLayout | null;
    const savedBrandColor = localStorage.getItem('brandColor') as BrandColor | null;
    const savedSoundPreference = localStorage.getItem('soundPreference') as SoundPreference | null;
    const savedMobileOptimized = localStorage.getItem('mobileOptimized');
    
    if (savedColor) setColor(savedColor);
    if (savedLayout) setLayout(savedLayout);
    if (savedBrandColor) setBrandColor(savedBrandColor);
    if (savedSoundPreference) setSoundPreference(savedSoundPreference);
    if (savedMobileOptimized !== null) setMobileOptimized(savedMobileOptimized === 'true');
    
    // Apply brand color class to body
    if (savedBrandColor) {
      document.body.classList.remove('brand-default', 'brand-black', 'brand-red', 'brand-white');
      document.body.classList.add(`brand-${savedBrandColor}`);
    }
  }, []);
  
  // Apply theme changes and save to localStorage
  const applyTheme = () => {
    localStorage.setItem('themeColor', color);
    localStorage.setItem('themeLayout', layout);
    localStorage.setItem('brandColor', brandColor);
    localStorage.setItem('soundPreference', soundPreference);
    localStorage.setItem('mobileOptimized', String(isMobileOptimized));
    
    // Apply brand color class to body
    document.body.classList.remove('brand-default', 'brand-black', 'brand-red', 'brand-white');
    document.body.classList.add(`brand-${brandColor}`);
    
    // Play success sound
    playSound('success');
    
    // Show toast notification
    toast({
      title: "Theme Updated",
      description: "Your theme preferences have been saved."
    });
  };
  
  return (
    <ThemeContext.Provider
      value={{
        color,
        layout,
        brandColor,
        soundPreference,
        isMobileOptimized,
        setColor,
        setLayout,
        setBrandColor,
        setSoundPreference,
        setMobileOptimized,
        applyTheme,
        playSound
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
