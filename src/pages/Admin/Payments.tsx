
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CircleDollarSign,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Printer,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range";

const mockPayments = [
  {
    id: "INV-2023-001",
    client: "Sarah Johnson",
    amount: 1250,
    date: "2023-06-15",
    status: "paid",
    method: "eft",
    service: "Wedding Photography",
  },
  {
    id: "INV-2023-002",
    client: "Michael Brown",
    amount: 750,
    date: "2023-06-18",
    status: "pending",
    method: "cash",
    service: "Portrait Session",
  },
  {
    id: "INV-2023-003",
    client: "Emma Williams",
    amount: 2500,
    date: "2023-06-20",
    status: "paid",
    method: "online",
    service: "Commercial Shoot",
  },
  {
    id: "INV-2023-004",
    client: "James Smith",
    amount: 1800,
    date: "2023-06-22",
    status: "refunded",
    method: "online",
    service: "Event Coverage",
  },
  {
    id: "INV-2023-005",
    client: "Olivia Davis",
    amount: 950,
    date: "2023-06-25",
    status: "pending",
    method: "eft",
    service: "Family Portraits",
  },
  {
    id: "INV-2023-006",
    client: "William Jones",
    amount: 3200,
    date: "2023-06-28",
    status: "paid",
    method: "online",
    service: "Product Photography",
  },
  {
    id: "INV-2023-007",
    client: "Sophia Miller",
    amount: 1100,
    date: "2023-07-02",
    status: "pending",
    method: "cash",
    service: "Graduation Photos",
  },
  {
    id: "INV-2023-008",
    client: "Benjamin Wilson",
    amount: 4500,
    date: "2023-07-05",
    status: "paid",
    method: "eft",
    service: "Corporate Event",
  },
];

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Filter payments based on search term and filters
  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate summary statistics
  const totalPaid = filteredPayments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPending = filteredPayments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalRefunded = filteredPayments
    .filter(p => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "outline";
      case "refunded":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "refunded":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all client payments and invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print Invoices
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">{filteredPayments.filter(p => p.status === "paid").length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">{filteredPayments.filter(p => p.status === "pending").length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalRefunded)}
            </div>
            <p className="text-xs text-muted-foreground">{filteredPayments.filter(p => p.status === "refunded").length} invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Records</CardTitle>
          <CardDescription>View and filter all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[150px]">
                  <CircleDollarSign className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="eft">EFT</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
              
              <CalendarDateRangePicker />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.client}</TableCell>
                  <TableCell className="hidden md:table-cell">{payment.service}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {payment.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(payment.status)} 
                      className={`capitalize ${getStatusBadgeStyle(payment.status)}`}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Invoice</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Mark as Refunded</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No matching payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;

// Missing types import
import { SlidersHorizontal } from "lucide-react";
