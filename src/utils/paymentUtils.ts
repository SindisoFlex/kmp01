
import { toast } from "@/hooks/use-toast";

export type PaymentMethod = 'eft' | 'cash' | 'online';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  clientId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  paymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample data for development purposes
const sampleInvoices: Invoice[] = [
  {
    id: "inv-001",
    bookingId: "1",
    clientId: "client-001",
    number: "INV-2025-001",
    issueDate: "2025-05-01T10:00:00",
    dueDate: "2025-05-15T10:00:00",
    amount: 149.99,
    tax: 22.50,
    total: 172.49,
    status: 'issued',
    notes: "Portrait Photography Session",
    createdAt: "2025-05-01T10:00:00",
    updatedAt: "2025-05-01T10:00:00"
  },
  {
    id: "inv-002",
    bookingId: "2",
    clientId: "client-001",
    number: "INV-2025-002",
    issueDate: "2025-05-05T14:00:00",
    dueDate: "2025-05-19T14:00:00",
    amount: 199.99,
    tax: 30.00,
    total: 229.99,
    status: 'paid',
    paymentId: "pay-001",
    notes: "Family Photoshoot",
    createdAt: "2025-05-05T14:00:00",
    updatedAt: "2025-05-06T09:30:00"
  }
];

const samplePayments: Payment[] = [
  {
    id: "pay-001",
    bookingId: "2",
    amount: 229.99,
    currency: "ZAR",
    method: "online",
    status: "completed",
    transactionId: "tx_12345",
    description: "Payment for Family Photoshoot",
    createdAt: "2025-05-06T09:30:00",
    updatedAt: "2025-05-06T09:30:00"
  }
];

// Get invoice by booking ID
export const getInvoiceByBookingId = (bookingId: string): Invoice | undefined => {
  return sampleInvoices.find(invoice => invoice.bookingId === bookingId);
};

// Get all invoices for a client
export const getInvoicesByClientId = (clientId: string): Invoice[] => {
  return sampleInvoices.filter(invoice => invoice.clientId === clientId);
};

// Generate a new invoice
export const generateInvoice = (
  bookingId: string,
  clientId: string,
  amount: number,
  description: string
): Invoice => {
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + 14); // Due in 14 days
  
  const tax = amount * 0.15; // 15% tax
  const total = amount + tax;
  
  const invoiceNumber = `INV-${currentDate.getFullYear()}-${sampleInvoices.length + 1}`.padStart(10, '0');
  
  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    bookingId,
    clientId,
    number: invoiceNumber,
    issueDate: currentDate.toISOString(),
    dueDate: dueDate.toISOString(),
    amount,
    tax,
    total,
    status: 'issued',
    notes: description,
    createdAt: currentDate.toISOString(),
    updatedAt: currentDate.toISOString()
  };
  
  // In a real app, save to database
  sampleInvoices.push(newInvoice);
  
  // Notify client
  sendInvoiceNotification(newInvoice);
  
  return newInvoice;
};

// Process a payment for an invoice
export const processPayment = (
  invoiceId: string,
  method: PaymentMethod,
  transactionId?: string
): Payment | null => {
  const invoice = sampleInvoices.find(inv => inv.id === invoiceId);
  if (!invoice) {
    toast({
      title: "Payment Error",
      description: "Invoice not found",
      variant: "destructive",
    });
    return null;
  }
  
  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    bookingId: invoice.bookingId,
    amount: invoice.total,
    currency: "ZAR",
    method,
    status: "completed",
    transactionId,
    description: `Payment for ${invoice.notes}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Update invoice status
  invoice.status = 'paid';
  invoice.paymentId = newPayment.id;
  invoice.updatedAt = new Date().toISOString();
  
  // In a real app, save to database
  samplePayments.push(newPayment);
  
  // Notify client
  sendPaymentNotification(newPayment, invoice);
  
  return newPayment;
};

// Calculate refund amount based on cancellation timing
export const calculateRefundAmount = (
  bookingId: string,
  cancellationDate: Date,
  bookingDate: Date
): number => {
  const invoice = sampleInvoices.find(inv => inv.bookingId === bookingId);
  if (!invoice) {
    return 0;
  }
  
  const daysDifference = Math.floor((bookingDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Refund policy:
  // > 14 days: 100% refund
  // 7-14 days: 75% refund
  // 3-7 days: 50% refund
  // 1-3 days: 25% refund
  // < 24 hours: No refund
  
  if (daysDifference > 14) {
    return invoice.total;
  } else if (daysDifference >= 7) {
    return invoice.total * 0.75;
  } else if (daysDifference >= 3) {
    return invoice.total * 0.5;
  } else if (daysDifference >= 1) {
    return invoice.total * 0.25;
  } else {
    return 0;
  }
};

// Process a refund
export const processRefund = (
  paymentId: string,
  amount: number,
  reason: string
): Payment | null => {
  const payment = samplePayments.find(p => p.id === paymentId);
  if (!payment) {
    toast({
      title: "Refund Error",
      description: "Payment not found",
      variant: "destructive",
    });
    return null;
  }
  
  const isFullRefund = amount === payment.amount;
  
  const refundPayment: Payment = {
    id: `ref-${Date.now()}`,
    bookingId: payment.bookingId,
    amount: -amount, // Negative amount for refund
    currency: payment.currency,
    method: payment.method,
    status: "completed",
    transactionId: `refund_${payment.transactionId}`,
    description: `Refund: ${reason}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Update original payment status
  payment.status = isFullRefund ? 'refunded' : 'partially_refunded';
  payment.updatedAt = new Date().toISOString();
  
  // In a real app, save to database
  samplePayments.push(refundPayment);
  
  // Update invoice status if needed
  const invoice = sampleInvoices.find(inv => inv.paymentId === paymentId);
  if (invoice) {
    invoice.status = isFullRefund ? 'cancelled' : 'paid';
    invoice.updatedAt = new Date().toISOString();
  }
  
  // Notify client
  sendRefundNotification(refundPayment, reason);
  
  return refundPayment;
};

// Notification functions
export const sendInvoiceNotification = (invoice: Invoice) => {
  toast({
    title: "Invoice Generated",
    description: `Invoice #${invoice.number} for R${invoice.total.toFixed(2)} has been issued.`,
  });
  // In a real app, would also send email/SMS
  console.log("Invoice notification sent:", invoice.number);
};

export const sendPaymentNotification = (payment: Payment, invoice: Invoice) => {
  toast({
    title: "Payment Successful",
    description: `Your payment of R${payment.amount.toFixed(2)} for invoice #${invoice.number} has been processed.`,
    variant: "default",
  });
  // In a real app, would also send email/SMS
  console.log("Payment notification sent for:", payment.id);
};

export const sendRefundNotification = (refund: Payment, reason: string) => {
  toast({
    title: "Refund Processed",
    description: `Your refund of R${Math.abs(refund.amount).toFixed(2)} has been processed. Reason: ${reason}`,
    variant: "default",
  });
  // In a real app, would also send email/SMS
  console.log("Refund notification sent for:", refund.id);
};
