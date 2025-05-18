import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethod, processPayment } from "@/utils/paymentUtils";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Landmark, BanknoteIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PaymentFormProps {
  invoiceId: string;
  amount: number;
  onPaymentComplete: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ invoiceId, amount, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to make a payment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // For online payments, in a real app we'd redirect to a payment gateway
    // For EFT and cash, we just process the payment directly with a reference
    
    try {
      const payment = processPayment(invoiceId, paymentMethod, reference || undefined);
      if (payment) {
        toast({
          title: "Payment Successful",
          description: `Your payment of R${amount.toFixed(2)} has been processed.`,
        });
        onPaymentComplete();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          >
            <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online" className="flex items-center cursor-pointer">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Online Payment (Credit/Debit Card)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
              <RadioGroupItem value="eft" id="eft" />
              <Label htmlFor="eft" className="flex items-center cursor-pointer">
                <Landmark className="h-4 w-4 mr-2" />
                <span>Electronic Funds Transfer (EFT)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center cursor-pointer">
                <BanknoteIcon className="h-4 w-4 mr-2" />
                <span>Cash Payment</span>
              </Label>
            </div>
          </RadioGroup>
          
          {paymentMethod === "online" && (
            <div className="border rounded-md p-4 bg-gray-50">
              <p className="text-sm">
                You'll be redirected to our secure payment gateway to complete your payment.
              </p>
            </div>
          )}
          
          {paymentMethod === "eft" && (
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Banking Details</h3>
                  <p className="text-sm text-gray-600">Please make your payment to:</p>
                  <div className="mt-2 text-sm">
                    <p>Bank: FNB</p>
                    <p>Account Name: Studio Photography</p>
                    <p>Account Number: 1234 5678 9012</p>
                    <p>Branch Code: 250655</p>
                    <p>Reference: INV-{invoiceId}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Your Payment Reference</Label>
                  <Input 
                    id="reference" 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. John Smith INV-001"
                    required={paymentMethod === 'eft'}
                  />
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === "cash" && (
            <div className="border rounded-md p-4 bg-gray-50">
              <p className="text-sm">
                Please bring the exact amount in cash to our studio during business hours.
                Our address is: 123 Photography Lane, Studio City, 2000
              </p>
              <div className="space-y-2 mt-4">
                <Label htmlFor="cash-notes">Notes (Optional)</Label>
                <Textarea 
                  id="cash-notes" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                />
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-semibold text-lg">R {amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Pay R${amount.toFixed(2)}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PaymentForm;
