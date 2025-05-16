
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Invoice, Payment } from "@/utils/paymentUtils";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ReceiptIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceDetailProps {
  invoice: Invoice;
  payment?: Payment;
  onPayNow?: () => void;
  onDownload?: () => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  invoice,
  payment,
  onPayNow,
  onDownload
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'issued':
        return <Badge className="bg-blue-500">Issued</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-200 text-gray-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Invoice #{invoice.number}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(invoice.issueDate)}
            </CardDescription>
          </div>
          {getStatusBadge(invoice.status)}
        </div>
      </CardHeader>
      <CardContent className="border-t border-gray-200 pt-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Service</h3>
            <p className="mt-1">{invoice.notes || 'Photography Services'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Issue Date</h3>
              <p className="mt-1">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <p className="mt-1">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span>R {invoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Tax (15%)</span>
              <span>R {invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 font-semibold">
              <span>Total</span>
              <span>R {invoice.total.toFixed(2)}</span>
            </div>
          </div>
          
          {payment && (
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-start space-x-2">
                <ReceiptIcon className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Payment Received</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(payment.createdAt)} via {payment.method}
                    {payment.transactionId && <span className="block text-xs">Ref: {payment.transactionId}</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {invoice.status === 'issued' && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start space-x-2">
              <InfoIcon className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-800">
                <span className="font-medium">Payment Due</span>
                <p>Please complete payment by {formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200 pt-4 flex justify-between">
        <Button variant="outline" onClick={onDownload}>
          Download PDF
        </Button>
        
        {invoice.status === 'issued' && onPayNow && (
          <Button onClick={onPayNow}>
            Pay Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InvoiceDetail;
