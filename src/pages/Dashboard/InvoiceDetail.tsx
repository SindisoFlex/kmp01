
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InvoiceDetailComponent from "@/components/payments/InvoiceDetail";
import PaymentForm from "@/components/payments/PaymentForm";
import { getInvoiceByBookingId, processPayment } from "@/utils/paymentUtils";
import { toast } from "@/hooks/use-toast";

const InvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // In a real app, we would fetch the invoice from an API
  const invoice = invoiceId 
    ? { ...getInvoiceByBookingId("1"), id: invoiceId } // Mock data for demo
    : null;
  
  if (!invoice) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8 text-center">
          <h2 className="text-xl font-semibold">Invoice not found</h2>
          <p className="mt-2 text-muted-foreground">The invoice you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard/invoices')} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }
  
  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your invoice PDF is being downloaded.",
    });
    // In a real app, this would generate and download a PDF
    console.log("Downloading invoice:", invoice.number);
  };
  
  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    // In a real app, we would refresh the invoice data from the API
    toast({
      title: "Payment Successful",
      description: "Thank you for your payment!",
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/dashboard/invoices')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
        </Button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Invoice #{invoice.number}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            
            {invoice.status === 'issued' && (
              <Button onClick={() => setShowPaymentDialog(true)}>
                <CreditCard className="h-4 w-4 mr-2" /> Pay Now
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Invoice Detail */}
      <div className="max-w-3xl mx-auto">
        <InvoiceDetailComponent 
          invoice={invoice} 
          onDownload={handleDownload}
          onPayNow={() => setShowPaymentDialog(true)}
        />
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm 
            invoiceId={invoice.id} 
            amount={invoice.total} 
            onPaymentComplete={handlePaymentComplete} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceDetailPage;
