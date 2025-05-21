
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CategorySelectionProps {
  service: string;
  selectedCategory: string;
  onSelect: (category: string) => void;
}

// Service categories
const serviceCategories = {
  photography: [
    { id: "wedding", name: "Wedding Photography", description: "Capture your special day" },
    { id: "funeral", name: "Funeral Photography", description: "Respectful memorial documentation" },
    { id: "portrait", name: "Portrait Photography", description: "Professional portraits for individuals & groups" },
    { id: "commercial", name: "Commercial Photography", description: "Product & business photography" },
    { id: "event", name: "Event Photography", description: "Coverage for special occasions" },
  ],
  videography: [
    { id: "wedding", name: "Wedding Videography", description: "Cinematic wedding films" },
    { id: "funeral", name: "Funeral Videography", description: "Memorial service documentation" },
    { id: "shortfilm", name: "Short Films", description: "Documentary & narrative filmmaking" },
    { id: "livestream", name: "Livestreaming", description: "Live event broadcasting" },
    { id: "commercial", name: "Commercial Videos", description: "Promotional & marketing videos" },
  ],
  webdev: [
    { id: "website", name: "Website Development", description: "Custom responsive websites" },
    { id: "app", name: "Mobile App Development", description: "iOS & Android applications" },
    { id: "ecommerce", name: "E-Commerce Solutions", description: "Online stores & payment systems" },
    { id: "cms", name: "Content Management", description: "Easy-to-update web systems" },
  ],
  aitraining: [
    { id: "bootcamp", name: "AI Basics Bootcamp", description: "Fundamentals of AI for beginners" },
    { id: "business", name: "AI for Business", description: "Integrating AI into your business" },
    { id: "agent", name: "Build Your AI Agent", description: "Advanced AI development" },
    { id: "consulting", name: "AI Consulting", description: "Custom AI strategy & implementation" },
  ],
  marketing: [
    { id: "social", name: "Social Media Marketing", description: "Platform-specific campaigns" },
    { id: "content", name: "Content Creation", description: "Engaging digital content" },
    { id: "seo", name: "SEO & Analytics", description: "Search optimization & traffic analysis" },
    { id: "campaign", name: "Marketing Campaigns", description: "Full-service marketing solutions" },
  ],
  printing: [
    { id: "business", name: "Business Materials", description: "Cards, flyers & brochures" },
    { id: "event", name: "Event Printing", description: "Programs, signage & tickets" },
    { id: "custom", name: "Custom Merchandise", description: "T-shirts, mugs & promotional items" },
    { id: "large", name: "Large Format Printing", description: "Posters, banners & displays" },
  ],
};

const CategorySelection: React.FC<CategorySelectionProps> = ({ service, selectedCategory, onSelect }) => {
  // Get categories based on selected service
  const categories = serviceCategories[service as keyof typeof serviceCategories] || [];

  if (categories.length === 0) {
    return <div className="text-center py-8">Please select a service first</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        
        return (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all border-2 ${
              isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/20"
            }`}
            onClick={() => onSelect(category.id)}
          >
            <CardContent className="p-6">
              <h3 className={`text-lg font-medium ${isSelected ? "text-primary" : ""}`}>
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategorySelection;
