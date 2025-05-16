
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Payment } from "@/utils/paymentUtils";
import { Badge } from "@/components/ui/badge";

interface PaymentHistoryProps {
  payments: Payment[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatMethod = (method: string) => {
    switch (method) {
      case 'online':
        return 'Online Payment';
      case 'eft':
        return 'EFT Transfer';
      case 'cash':
        return 'Cash Payment';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };
  
  const getStatusBadge = (status: string, amount: number) => {
    if (amount < 0) {
      return <Badge className="bg-purple-500">Refund</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No payment records found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div 
              key={payment.id} 
              className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatMethod(payment.method)}</span>
                  {getStatusBadge(payment.status, payment.amount)}
                </div>
                <div className="text-sm text-gray-500 mt-1">{formatDate(payment.createdAt)}</div>
                {payment.description && (
                  <div className="text-sm mt-1">{payment.description}</div>
                )}
                {payment.transactionId && (
                  <div className="text-xs text-gray-500">Ref: {payment.transactionId}</div>
                )}
              </div>
              <div className={`font-medium ${payment.amount < 0 ? 'text-purple-600' : ''}`}>
                {payment.amount < 0 ? '-' : ''}R {Math.abs(payment.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
