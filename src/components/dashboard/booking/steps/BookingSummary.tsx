
import React from "react";
import { Camera, Video, Globe, Brain, Megaphone, Printer, CalendarDays, Clock, MapPin, FileText, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookingSummaryProps {
  bookingData: {
    service: string;
    category: string;
    date?: Date;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    attachments: File[];
    extras: string[];
  };
}

// Mapping for service names and icons
const serviceInfo = {
  photography: { name: "Photography", icon: Camera },
  videography: { name: "Videography", icon: Video },
  webdev: { name: "Web/App Development", icon: Globe },
  aitraining: { name: "AI Training", icon: Brain },
  marketing: { name: "Digital Marketing", icon: Megaphone },
  printing: { name: "Printing", icon: Printer },
};

// Category mappings for each service
const categoryMappings: Record<string, Record<string, string>> = {
  photography: {
    wedding: "Wedding Photography",
    funeral: "Funeral Photography",
    portrait: "Portrait Photography",
    commercial: "Commercial Photography",
    event: "Event Photography",
  },
  videography: {
    wedding: "Wedding Videography",
    funeral: "Funeral Videography",
    shortfilm: "Short Films/Documentaries",
    livestream: "Livestreaming Services",
    commercial: "Commercial Videography",
  },
  webdev: {
    website: "Website Development",
    app: "Mobile App Development",
    ecommerce: "E-Commerce Solutions",
    cms: "Content Management Systems",
  },
  aitraining: {
    bootcamp: "AI Basics Bootcamp",
    business: "AI for Business Integration",
    agent: "Build Your AI Agent",
    consulting: "AI Consulting Services",
  },
  marketing: {
    social: "Social Media Marketing",
    content: "Content Creation",
    seo: "SEO & Analytics",
    campaign: "Marketing Campaigns",
  },
  printing: {
    business: "Business Materials",
    event: "Event Printing",
    custom: "Custom Merchandise",
    large: "Large Format Printing",
  },
};

// Extra item name mappings
const extrasMappings: Record<string, string> = {
  prints: "Extra Prints",
  drone: "Drone Footage",
  sameday: "Same-Day Delivery",
  framed: "Framed Photos",
  transportation: "Transportation",
  extraediting: "Extra Editing Hours",
  soundtrack: "Custom Soundtrack",
  hardcopy: "Hard Copy Delivery",
  seo: "SEO Package",
  analytics: "Analytics Setup",
  contentcreation: "Content Creation",
  maintenance: "Maintenance Plan",
  hosting: "Premium Hosting",
  materials: "Course Materials",
  certificate: "Premium Certificate",
  recording: "Session Recording",
  followup: "Follow-up Session",
  customcontent: "Customized Content",
  socialmedia: "Social Media Setup",
  contentcalendar: "Content Calendar",
  competitoranalysis: "Competitor Analysis",
  targetaudience: "Target Audience Research",
  rush: "Rush Service",
  design: "Design Services",
  premium: "Premium Materials",
  packaging: "Custom Packaging",
  delivery: "Delivery Service",
};

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookingData }) => {
  // Get service icon and name
  const service = serviceInfo[bookingData.service as keyof typeof serviceInfo] || { name: "Service", icon: Package };
  const ServiceIcon = service.icon;
  
  // Get category name
  const categoryName = bookingData.category && bookingData.service 
    ? categoryMappings[bookingData.service]?.[bookingData.category] 
    : "Unknown Category";
  
  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return "Not specified";
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Please review your booking details before submitting.
      </p>
      
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Service & Category */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Service Details</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ServiceIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{categoryName}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Date and Time */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(bookingData.date)}</p>
                </div>
              </div>
              
              {(bookingData.startTime || bookingData.endTime) && (
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.startTime && bookingData.endTime
                        ? `${bookingData.startTime} - ${bookingData.endTime}`
                        : bookingData.startTime || bookingData.endTime || "Not specified"}
                    </p>
                  </div>
                </div>
              )}
              
              {bookingData.location && (
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{bookingData.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          {bookingData.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Details</h3>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{bookingData.description}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Attachments */}
          {bookingData.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Attachments</h3>
              <ul className="space-y-1 text-sm">
                {bookingData.attachments.map((file, index) => (
                  <li key={index} className="text-muted-foreground">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Selected extras */}
          {bookingData.extras.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Selected Add-ons</h3>
              <ul className="space-y-1">
                {bookingData.extras.map((extraId) => (
                  <li key={extraId} className="text-sm flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    {extrasMappings[extraId] || extraId}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900 p-4 rounded-md">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Once submitted, our team will review your booking and contact you with confirmation details and pricing.
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
