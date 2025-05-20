
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Video, Globe, Brain, Megaphone, Printer } from "lucide-react";

interface ServiceSelectionProps {
  selectedService: string;
  onSelect: (service: string) => void;
}

const services = [
  { id: "photography", name: "Photography", icon: Camera, description: "Professional photo sessions for all occasions" },
  { id: "videography", name: "Videography", icon: Video, description: "High-quality video production services" },
  { id: "webdev", name: "Web/App Development", icon: Globe, description: "Custom websites and mobile applications" },
  { id: "aitraining", name: "AI Training", icon: Brain, description: "Learn to leverage AI for your business" },
  { id: "marketing", name: "Digital Marketing", icon: Megaphone, description: "Promote your brand across digital channels" },
  { id: "printing", name: "Printing", icon: Printer, description: "Professional printing for all your needs" }
];

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ selectedService, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const ServiceIcon = service.icon;
        const isSelected = selectedService === service.id;
        
        return (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all border-2 ${
              isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/20"
            }`}
            onClick={() => onSelect(service.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`p-3 rounded-full ${
                isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
              }`}>
                <ServiceIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{service.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceSelection;
