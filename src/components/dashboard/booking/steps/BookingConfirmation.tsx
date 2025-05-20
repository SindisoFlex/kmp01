
import React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";

const BookingConfirmation: React.FC = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 pb-4 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Submitted!</h2>
        <p className="text-muted-foreground mb-4">
          Your booking request has been successfully submitted. Our team will review it and get back to you shortly.
        </p>
        <div className="bg-muted/40 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">What happens next?</p>
          <ul className="text-sm text-muted-foreground text-left list-disc pl-5 pt-2 space-y-1">
            <li>You'll receive a confirmation email with your booking details</li>
            <li>Our team will review your request within 24 hours</li>
            <li>We may contact you for additional information if needed</li>
            <li>Once approved, you'll receive a booking confirmation with next steps</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4 pt-2 pb-6">
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link to="/dashboard/bookings">View My Bookings</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingConfirmation;
