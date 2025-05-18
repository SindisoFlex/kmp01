import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInvoicesByClientId } from "@/utils/paymentUtils";
import InvoicesList from "@/components/payments/InvoicesList";
import { useAuth } from "@/hooks/useAuth";

const InvoicesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  // In a real app, we would fetch invoices from an API
  const clientId = "client-001"; // This would come from user auth context
  const allInvoices = getInvoicesByClientId(clientId);
  
  const pendingInvoices = allInvoices.filter(inv => inv.status === 'issued' || inv.status === 'overdue');
  const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
  
  const invoicesToShow = activeTab === "all" 
    ? allInvoices 
    : activeTab === "pending" 
    ? pendingInvoices 
    : paidInvoices;
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Invoices & Payments</h1>
        <p className="text-muted-foreground">View and manage your invoices</p>
      </div>
      
      {/* Summary Cards */}
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
      
      {/* Invoice List */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <InvoicesList invoices={invoicesToShow} />
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          <InvoicesList invoices={invoicesToShow} />
        </TabsContent>
        <TabsContent value="paid" className="mt-0">
          <InvoicesList invoices={invoicesToShow} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoicesDashboard;
