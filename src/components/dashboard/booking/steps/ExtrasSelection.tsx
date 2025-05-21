
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ExtrasSelectionProps {
  service: string;
  category: string;
  selectedExtras: string[];
  onUpdate: (extras: string[]) => void;
}

// Define extras based on service type
const serviceExtras: Record<string, { id: string; name: string; description: string; price?: string }[]> = {
  photography: [
    { id: "prints", name: "Extra Prints", description: "Additional professional photo prints", price: "From R150" },
    { id: "drone", name: "Drone Footage", description: "Aerial photography shots", price: "R1,200" },
    { id: "sameday", name: "Same-Day Delivery", description: "Rush delivery of selected photos", price: "R800" },
    { id: "framed", name: "Framed Photos", description: "Professional framing service", price: "From R350" },
    { id: "transportation", name: "Transportation", description: "Transportation to venue", price: "R400" },
  ],
  videography: [
    { id: "drone", name: "Drone Footage", description: "Aerial video capture", price: "R1,500" },
    { id: "extraediting", name: "Extra Editing Hours", description: "Additional post-production time", price: "R550/hour" },
    { id: "soundtrack", name: "Custom Soundtrack", description: "Licensed music selection", price: "R900" },
    { id: "sameday", name: "Same-Day Highlight", description: "Short highlight reel delivered same-day", price: "R1,200" },
    { id: "hardcopy", name: "Hard Copy Delivery", description: "USB/DVD delivery", price: "R300" },
  ],
  webdev: [
    { id: "seo", name: "SEO Package", description: "Search engine optimization", price: "R2,500" },
    { id: "analytics", name: "Analytics Setup", description: "Traffic tracking implementation", price: "R800" },
    { id: "contentcreation", name: "Content Creation", description: "Professional copywriting", price: "R250/page" },
    { id: "maintenance", name: "Maintenance Plan", description: "Ongoing website support", price: "From R650/month" },
    { id: "hosting", name: "Premium Hosting", description: "Fast, reliable web hosting", price: "R200/month" },
  ],
  aitraining: [
    { id: "materials", name: "Course Materials", description: "Printed reference guides", price: "R350/person" },
    { id: "certificate", name: "Premium Certificate", description: "Accredited certification", price: "R750" },
    { id: "recording", name: "Session Recording", description: "Full video recording of training", price: "R1,200" },
    { id: "followup", name: "Follow-up Session", description: "One-on-one consultation", price: "R1,100" },
    { id: "customcontent", name: "Customized Content", description: "Industry-specific examples", price: "R2,000" },
  ],
  marketing: [
    { id: "analytics", name: "Advanced Analytics", description: "Detailed performance reports", price: "R1,500" },
    { id: "socialmedia", name: "Social Media Setup", description: "Profile creation and optimization", price: "R2,000" },
    { id: "contentcalendar", name: "Content Calendar", description: "3-month content planning", price: "R1,800" },
    { id: "competitoranalysis", name: "Competitor Analysis", description: "Market positioning report", price: "R2,500" },
    { id: "targetaudience", name: "Target Audience Research", description: "Customer persona development", price: "R1,900" },
  ],
  printing: [
    { id: "rush", name: "Rush Service", description: "Expedited production", price: "Add 30%" },
    { id: "design", name: "Design Services", description: "Professional graphic design", price: "From R600" },
    { id: "premium", name: "Premium Materials", description: "High-quality paper/materials", price: "From R250" },
    { id: "packaging", name: "Custom Packaging", description: "Branded packaging options", price: "From R800" },
    { id: "delivery", name: "Delivery Service", description: "Direct shipping to your location", price: "From R150" },
  ],
};

const ExtrasSelection: React.FC<ExtrasSelectionProps> = ({ service, category, selectedExtras, onUpdate }) => {
  const extras = serviceExtras[service] || [];
  
  const toggleExtra = (extraId: string) => {
    const updatedExtras = selectedExtras.includes(extraId)
      ? selectedExtras.filter(id => id !== extraId)
      : [...selectedExtras, extraId];
    
    onUpdate(updatedExtras);
  };

  if (extras.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No extras available for this service.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Enhance your {service} experience with these optional add-ons:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.map((extra) => {
          const isSelected = selectedExtras.includes(extra.id);
          
          return (
            <Card 
              key={extra.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "border-primary bg-primary/5" : "hover:border-primary/20"
              }`}
              onClick={() => toggleExtra(extra.id)}
            >
              <CardContent className="p-4 flex items-start space-x-3">
                <Checkbox 
                  id={`extra-${extra.id}`} 
                  checked={isSelected}
                  onCheckedChange={() => toggleExtra(extra.id)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={`extra-${extra.id}`}
                    className="text-base font-medium cursor-pointer"
                  >
                    {extra.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{extra.description}</p>
                  {extra.price && (
                    <p className="text-sm font-medium text-primary">{extra.price}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <p className="text-sm text-muted-foreground italic">
        * Final pricing will be confirmed upon booking approval
      </p>
    </div>
  );
};

export default ExtrasSelection;
