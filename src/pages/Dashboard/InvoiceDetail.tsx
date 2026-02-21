
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInvoiceByIdForUser } from "@/services/invoiceService";
import { generateInvoicePdf } from "@/services/pdfInvoiceService";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/utils/formatting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceWithBookingAndUser } from "@/types/invoice";

const InvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceWithBookingAndUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!invoiceId || !user?.id) {
        setIsLoading(false);
        setErrorMessage("You must be signed in to view invoices.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const row = await getInvoiceByIdForUser(invoiceId, user.id);
        if (!row) {
          setErrorMessage("The invoice you requested was not found.");
          setInvoice(null);
        } else {
          setInvoice(row);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        setErrorMessage(`Unable to load invoice. Please try again. (${message})`);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [invoiceId, user?.id]);

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8 text-center text-muted-foreground">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice || errorMessage) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8 text-center">
          <h2 className="text-xl font-semibold">Invoice not found</h2>
          <p className="mt-2 text-muted-foreground">{errorMessage || "The invoice you're looking for doesn't exist."}</p>
          <Button onClick={() => navigate('/dashboard/invoices')} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    generateInvoicePdf(invoice);
    toast({
      title: "Invoice Downloaded",
      description: `Invoice ${invoice.invoice_number} has been downloaded.`,
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
          <h1 className="text-2xl font-semibold">Invoice {invoice.invoice_number}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload} disabled={invoice.status !== "paid"}>
              <Download className="h-4 w-4 mr-2" />
              {invoice.status === "paid" ? "Download Invoice" : "Download Available After Payment"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{invoice.invoice_number}</CardTitle>
          <CardDescription>Status: {invoice.status}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Issued At</p>
              <p>{formatDateTime(invoice.issued_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid At</p>
              <p>{formatDateTime(invoice.paid_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p>{formatCurrency(invoice.amount, invoice.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Booking</p>
              <p>{invoice.booking?.id || invoice.booking_id}</p>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground">Service</p>
            <p>{invoice.booking?.type || "N/A"}</p>
            <p className="text-xs text-muted-foreground mt-2">Category</p>
            <p>{invoice.booking?.category || "N/A"}</p>
            <p className="text-xs text-muted-foreground mt-2">Location</p>
            <p>{invoice.booking?.location || "N/A"}</p>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground">Billed To</p>
            <p>{invoice.userProfile?.name || "N/A"}</p>
            <p className="text-sm text-muted-foreground">{invoice.userProfile?.email || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetailPage;
