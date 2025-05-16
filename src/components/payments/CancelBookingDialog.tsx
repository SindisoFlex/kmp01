
import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { calculateRefundAmount } from "@/utils/paymentUtils";
import { toast } from "@/hooks/use-toast";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingDate: Date;
  onCancellationComplete: () => void;
}

const CancelBookingDialog: React.FC<CancelBookingDialogProps> = ({
  open,
  onOpenChange,
  bookingId,
  bookingDate,
  onCancellationComplete
}) => {
  const [reason, setReason] = useState("schedule_conflict");
  const [details, setDetails] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const now = new Date();
  const refundAmount = calculateRefundAmount(bookingId, now, bookingDate);
  const daysDifference = Math.floor((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const handleCancel = () => {
    setIsProcessing(true);
    
    // In a real app, this would call an API to cancel the booking
    setTimeout(() => {
      toast({
        title: "Booking Cancelled",
        description: `Your booking has been cancelled. ${refundAmount > 0 ? `A refund of R${refundAmount.toFixed(2)} will be processed.` : 'No refund will be processed.'}`,
      });
      setIsProcessing(false);
      onOpenChange(false);
      onCancellationComplete();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling your booking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <RadioGroup value={reason} onValueChange={setReason}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="schedule_conflict" id="schedule_conflict" />
              <Label htmlFor="schedule_conflict">Schedule Conflict</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="illness" id="illness" />
              <Label htmlFor="illness">Illness or Emergency</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weather" id="weather" />
              <Label htmlFor="weather">Weather Concerns</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other Reason</Label>
            </div>
          </RadioGroup>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea 
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any additional information..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <h4 className="font-medium text-amber-800">Refund Information</h4>
            <p className="text-sm text-amber-700 mt-1">
              {daysDifference > 14 ? (
                "You will receive a full refund as your cancellation is more than 14 days before the booking date."
              ) : daysDifference >= 7 ? (
                "You will receive a 75% refund as your cancellation is 7-14 days before the booking date."
              ) : daysDifference >= 3 ? (
                "You will receive a 50% refund as your cancellation is 3-7 days before the booking date."
              ) : daysDifference >= 1 ? (
                "You will receive a 25% refund as your cancellation is 1-3 days before the booking date."
              ) : (
                "You will not receive a refund as your cancellation is less than 24 hours before the booking date."
              )}
            </p>
            <p className="text-sm font-medium text-amber-800 mt-2">
              Estimated Refund Amount: R{refundAmount.toFixed(2)}
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Nevermind
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;
