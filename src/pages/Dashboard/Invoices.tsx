import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getUserInvoices } from "@/services/invoiceService";
import { formatCurrency } from "@/utils/formatting";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { InvoiceRecord } from "@/types/invoice";

const InvoicesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allInvoices, setAllInvoices] = useState<InvoiceRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setAllInvoices([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const rows = await getUserInvoices(user.id);
        setAllInvoices(rows);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        setErrorMessage(`Unable to load invoices. Please try again. (${message})`);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const pendingInvoices = useMemo(
    () => allInvoices.filter((inv) => inv.status === "pending"),
    [allInvoices]
  );
  const paidInvoices = useMemo(
    () => allInvoices.filter((inv) => inv.status === "paid"),
    [allInvoices]
  );
  const invoicesToShow = activeTab === "all" ? allInvoices : activeTab === "pending" ? pendingInvoices : paidInvoices;
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Invoices & Payments</h1>
        <p className="text-muted-foreground">View your confirmed invoice records and download them.</p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Invoices</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allInvoices.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Payment</CardTitle>
            <CardDescription>Requires your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingInvoices.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Paid Invoices</CardTitle>
            <CardDescription>Successfully completed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paidInvoices.length}</p>
          </CardContent>
        </Card>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invoices...</div>
          ) : invoicesToShow.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No invoices found.</div>
          ) : (
            <div className="space-y-3">
              {invoicesToShow.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Amount: {formatCurrency(invoice.amount, invoice.currency)} | Status: {invoice.status}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/dashboard/invoices/${invoice.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        {invoice.status === "paid" ? "Download Invoice" : "View Invoice"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invoices...</div>
          ) : invoicesToShow.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending invoices.</div>
          ) : (
            <div className="space-y-3">
              {invoicesToShow.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Amount: {formatCurrency(invoice.amount, invoice.currency)} | Status: {invoice.status}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/dashboard/invoices/${invoice.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Invoice
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="paid" className="mt-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invoices...</div>
          ) : invoicesToShow.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No paid invoices.</div>
          ) : (
            <div className="space-y-3">
              {invoicesToShow.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Amount: {formatCurrency(invoice.amount, invoice.currency)} | Paid: {invoice.paid_at || "N/A"}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/dashboard/invoices/${invoice.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoicesDashboard;
