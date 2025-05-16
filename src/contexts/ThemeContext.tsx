
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeColor = 'default' | 'blue' | 'purple' | 'green' | 'pink' | 'orange';
export type ThemeLayout = 'grid' | 'masonry' | 'carousel';

interface ThemeContextType {
  color: ThemeColor;
  layout: ThemeLayout;
  setColor: (color: ThemeColor) => void;
  setLayout: (layout: ThemeLayout) => void;
  applyTheme: () => void;
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
  
  // Load theme settings from localStorage on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor') as ThemeColor | null;
    const savedLayout = localStorage.getItem('themeLayout') as ThemeLayout | null;
    
    if (savedColor) setColor(savedColor);
    if (savedLayout) setLayout(savedLayout);
  }, []);
  
  // Apply theme changes and save to localStorage
  const applyTheme = () => {
    localStorage.setItem('themeColor', color);
    localStorage.setItem('themeLayout', layout);
    // Show toast notification
    toast({
      title: "Theme Updated",
      description: "Your gallery theme preferences have been saved."
    });
  };
  
  return (
    <ThemeContext.Provider
      value={{
        color,
        layout,
        setColor,
        setLayout,
        applyTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
