
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import ServiceSelection from "./steps/ServiceSelection";
import CategorySelection from "./steps/CategorySelection";
import BookingDetailsForm from "./steps/BookingDetailsForm";
import ExtrasSelection from "./steps/ExtrasSelection";
import BookingSummary from "./steps/BookingSummary";
import BookingConfirmation from "./steps/BookingConfirmation";

// Define step names for the wizard
const steps = [
  "Service",
  "Category",
  "Details",
  "Extras",
  "Review",
];

const BookingWizard = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    service: "",
    category: "",
    date: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    attachments: [] as File[],
    extras: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Handle moving to next step
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle moving to previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Update booking data based on form inputs
  const updateBookingData = (data: Partial<typeof bookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to store the booking in a database
      // and notify the admin/staff
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a unique booking ID (in production this would come from the backend)
      const generatedBookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingId(generatedBookingId);
      
      // Log the booking to simulate database storage
      console.log("Booking submitted:", {
        id: generatedBookingId,
        ...bookingData,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Booking Submitted Successfully!",
        description: `Your booking reference is: ${generatedBookingId}`,
      });
      
      // Simulate notification to admin/staff
      console.log("Sending notification to admin/staff about new booking:", generatedBookingId);
      
      // Mark booking as complete
      setIsComplete(true);
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ServiceSelection 
          selectedService={bookingData.service} 
          onSelect={(service) => updateBookingData({ service })} 
        />;
      case 1:
        return <CategorySelection 
          service={bookingData.service}
          selectedCategory={bookingData.category}
          onSelect={(category) => updateBookingData({ category })}
        />;
      case 2:
        return <BookingDetailsForm
          bookingDetails={{
            date: bookingData.date,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            location: bookingData.location,
            description: bookingData.description,
            attachments: bookingData.attachments,
          }}
          onUpdate={(details) => updateBookingData(details)}
        />;
      case 3:
        return <ExtrasSelection
          service={bookingData.service}
          category={bookingData.category}
          selectedExtras={bookingData.extras}
          onUpdate={(extras) => updateBookingData({ extras })}
        />;
      case 4:
        return <BookingSummary 
          bookingData={bookingData}
        />;
      default:
        return null;
    }
  };

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !bookingData.service;
      case 1:
        return !bookingData.category;
      case 2:
        return !bookingData.date || !bookingData.location;
      default:
        return false;
    }
  };

  // If booking is complete, render confirmation
  if (isComplete) {
    return <BookingConfirmation bookingId={bookingId} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep 
                    ? "bg-primary text-white"
                    : index === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span 
                className={`text-xs mt-2 ${
                  index <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 h-1 bg-muted w-full"></div>
          <div 
            className="absolute top-0 h-1 bg-primary transition-all" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {currentStep < steps.length ? `Step ${currentStep + 1}: ${steps[currentStep]}` : "Complete"}
          </CardTitle>
          <CardDescription>
            {currentStep === 0 && "Select the primary service you're interested in."}
            {currentStep === 1 && "Choose a specific category for your selected service."}
            {currentStep === 2 && "Provide details about your booking."}
            {currentStep === 3 && "Add optional extras to enhance your service."}
            {currentStep === 4 && "Review your booking details before submitting."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={isNextDisabled()}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Booking"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingWizard;
