
import { toast } from "@/hooks/use-toast";

export type MediaVisibility = 'public' | 'private';
export type MediaType = 'image' | 'video';
export type ServiceCategory = 'portrait' | 'wedding' | 'event' | 'family' | 'commercial';

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  visibility: MediaVisibility;
  serviceCategory: ServiceCategory;
  uploadDate: string; // ISO date string
  expirationDate: string; // ISO date string
  isFavorite?: boolean;
}

export interface GalleryCollection {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  serviceCategory: ServiceCategory;
  thumbnailUrl?: string;
  itemCount: number;
  expirationDate: string; // ISO date string
}

// Calculate expiration date (24 months from today or upload date)
export const calculateExpirationDate = (fromDate: Date = new Date()): string => {
  const expirationDate = new Date(fromDate);
  expirationDate.setMonth(expirationDate.getMonth() + 24);
  return expirationDate.toISOString();
};

// Check if a gallery or item is expired
export const isExpired = (expirationDateStr: string): boolean => {
  const expirationDate = new Date(expirationDateStr);
  const today = new Date();
  return expirationDate < today;
};

// Calculate days remaining until expiration
export const daysUntilExpiration = (expirationDateStr: string): number => {
  const expirationDate = new Date(expirationDateStr);
  const today = new Date();
  const differenceInTime = expirationDate.getTime() - today.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};

// Format the expiration date for display
export const formatExpirationDate = (expirationDateStr: string): string => {
  const expirationDate = new Date(expirationDateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(expirationDate);
};

// Extend gallery expiration by 1 year (simulated payment of R100)
export const extendGalleryExpiration = (
  expirationDateStr: string, 
  onSuccess?: (newDate: string) => void
): string => {
  // In a real implementation, this would integrate with a payment system
  const currentExpDate = new Date(expirationDateStr);
  currentExpDate.setFullYear(currentExpDate.getFullYear() + 1);
  const newExpirationDate = currentExpDate.toISOString();
  
  toast({
    title: "Gallery Extended",
    description: `Your gallery expiration has been extended to ${formatExpirationDate(newExpirationDate)}.`
  });
  
  if (onSuccess) {
    onSuccess(newExpirationDate);
  }
  
  return newExpirationDate;
};

// Share gallery or media via email (simulation)
export const shareViaEmail = (
  email: string, 
  itemName: string, 
  itemId: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate API call to share via email
    setTimeout(() => {
      toast({
        title: "Shared Successfully",
        description: `"${itemName}" has been shared with ${email}.`
      });
      resolve(true);
    }, 1000);
  });
};

// Toggle visibility between public and private
export const toggleVisibility = (
  currentVisibility: MediaVisibility
): MediaVisibility => {
  return currentVisibility === 'public' ? 'private' : 'public';
};

// Mock data for galleries by service category
export const mockGalleries: GalleryCollection[] = [
  {
    id: "gal-1",
    title: "Spring Portrait Session",
    description: "Professional portrait photoshoot in natural light",
    date: "2025-05-02T10:00:00.000Z",
    serviceCategory: "portrait",
    thumbnailUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    itemCount: 24,
    expirationDate: calculateExpirationDate(new Date("2025-05-02"))
  },
  {
    id: "gal-2",
    title: "Johnson Family Gathering",
    description: "Annual family reunion photos",
    date: "2025-04-15T14:30:00.000Z",
    serviceCategory: "family",
    thumbnailUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    itemCount: 42,
    expirationDate: calculateExpirationDate(new Date("2025-04-15"))
  },
  {
    id: "gal-3",
    title: "Smith-Johnson Wedding",
    description: "Full wedding photography collection",
    date: "2025-03-28T16:00:00.000Z",
    serviceCategory: "wedding",
    thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456503681?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    itemCount: 156,
    expirationDate: calculateExpirationDate(new Date("2025-03-28"))
  },
  {
    id: "gal-4",
    title: "Corporate Annual Conference",
    description: "Event coverage for company's annual meeting",
    date: "2025-02-10T09:00:00.000Z",
    serviceCategory: "event",
    thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    itemCount: 87,
    expirationDate: calculateExpirationDate(new Date("2025-02-10"))
  },
  {
    id: "gal-5",
    title: "Product Launch Photography",
    description: "Professional product shots for new tech line",
    date: "2025-01-20T13:00:00.000Z",
    serviceCategory: "commercial",
    thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    itemCount: 32,
    expirationDate: calculateExpirationDate(new Date("2025-01-20"))
  }
];

// Mock data for media items
export const mockMediaItems: {[key: string]: MediaItem[]} = {
  "gal-1": [
    {
      id: "img-1-1",
      title: "Portrait 1",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      type: "image",
      visibility: "private",
      serviceCategory: "portrait",
      uploadDate: "2025-05-02T10:00:00.000Z",
      expirationDate: calculateExpirationDate(new Date("2025-05-02")),
      isFavorite: true
    },
    {
      id: "img-1-2",
      title: "Portrait 2",
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      type: "image",
      visibility: "public",
      serviceCategory: "portrait",
      uploadDate: "2025-05-02T10:15:00.000Z",
      expirationDate: calculateExpirationDate(new Date("2025-05-02"))
    },
    {
      id: "img-1-3",
      title: "Portrait 3",
      url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      type: "image",
      visibility: "private",
      serviceCategory: "portrait",
      uploadDate: "2025-05-02T10:30:00.000Z",
      expirationDate: calculateExpirationDate(new Date("2025-05-02"))
    }
  ],
  "gal-2": [
    {
      id: "img-2-1",
      title: "Family Photo 1",
      url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      type: "image",
      visibility: "private",
      serviceCategory: "family",
      uploadDate: "2025-04-15T14:30:00.000Z",
      expirationDate: calculateExpirationDate(new Date("2025-04-15")),
      isFavorite: true
    }
  ]
};

// Download a file (simulation)
export const downloadFile = (item: MediaItem): void => {
  // In a real app, this would trigger an actual download
  toast({
    title: "Download Started",
    description: `"${item.title}" is being downloaded.`
  });
  
  // Simulate download by opening image in new tab
  if (item.type === 'image') {
    window.open(item.url, '_blank');
  }
};

