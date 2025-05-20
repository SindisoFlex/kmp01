import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Filter, Receipt, FileText } from "lucide-react";
import { getInvoiceByBookingId, generateInvoice } from "@/utils/paymentUtils";
import CancelBookingDialog from "@/components/payments/CancelBookingDialog";
import { toast } from "@/hooks/use-toast";

const DashboardBookings: React.FC = () => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | null>(null);
  
  // Mock data for bookings
  const bookings = [
    { 
      id: "1", 
      service: "Portrait Photography", 
      date: "2025-06-01T10:00:00", 
      status: "confirmed",
      location: "Studio",
      price: 149.99
    },
    { 
      id: "2", 
      service: "Family Photoshoot", 
      date: "2025-06-15T14:30:00", 
      status: "pending",
      location: "Central Park",
      price: 199.99
    },
    { 
      id: "3", 
      service: "Product Photography", 
      date: "2025-05-10T09:00:00", 
      status: "completed",
      location: "Studio",
      price: 99.99
    },
    { 
      id: "4", 
      service: "Wedding Photography", 
      date: "2025-04-20T16:00:00", 
      status: "completed",
      location: "Beach Resort",
      price: 999.99
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'pending':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case 'completed':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'cancelled':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  const handleCancelClick = (bookingId: string, bookingDate: string) => {
    setSelectedBookingId(bookingId);
    setSelectedBookingDate(new Date(bookingDate));
    setShowCancelDialog(true);
  };
  
  const handleCancellationComplete = () => {
    // In a real app, we would update the booking status
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully.",
    });
  };
  
  const handleGenerateInvoice = (bookingId: string, service: string, price: number) => {
    // Check if an invoice already exists
    const existingInvoice = getInvoiceByBookingId(bookingId);
    
    if (existingInvoice) {
      toast({
        title: "Invoice Exists",
        description: `Invoice #${existingInvoice.number} already exists for this booking.`,
      });
      return;
    }
    
    // Generate a new invoice
    const newInvoice = generateInvoice(bookingId, "client-001", price, service);
    
    toast({
      title: "Invoice Generated",
      description: `Invoice #${newInvoice.number} has been created successfully.`,
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your photography sessions</p>
      </div>

      {/* Actions */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">All</Button>
          <Button variant="outline" size="sm">Upcoming</Button>
          <Button variant="outline" size="sm">Past</Button>
        </div>
        <Button asChild>
          <Link to="/dashboard/booking/new">New Booking</Link>
        </Button>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>All your scheduled and past sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const invoice = getInvoiceByBookingId(booking.id);
                
                return (
                  <div 
                    key={booking.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{booking.service}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center mt-1.5 space-x-2">
                        <span 
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClasses(booking.status)}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.location} • R{booking.price.toFixed(2)}
                        </span>
                      </div>
                      
                      {invoice && (
                        <div className="mt-2 flex items-center text-sm">
                          <FileText className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          <Link 
                            to={`/dashboard/invoices/${invoice.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Invoice #{invoice.number} - {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                      {booking.status === "completed" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/dashboard/gallery">
                            View Photos
                          </Link>
                        </Button>
                      )}
                      
                      {(booking.status === "confirmed" || booking.status === "pending") && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelClick(booking.id, booking.date)}
                          >
                            Cancel
                          </Button>
                          
                          {!invoice && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateInvoice(booking.id, booking.service, booking.price)}
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              Generate Invoice
                            </Button>
                          )}
                        </>
                      )}
                      
                      {invoice && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/invoices/${invoice.id}`}>
                            <Receipt className="h-4 w-4 mr-1" />
                            View Invoice
                          </Link>
                        </Button>
                      )}
                      
                      <Button variant="secondary" size="sm" asChild>
                        <Link to={`/dashboard/bookings/${booking.id}`}>
                          Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't scheduled any photography sessions yet
              </p>
              <Button asChild>
                <Link to="/dashboard/booking/new">Book your first session</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cancellation Dialog */}
      {selectedBookingId && selectedBookingDate && (
        <CancelBookingDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          bookingId={selectedBookingId}
          bookingDate={selectedBookingDate}
          onCancellationComplete={handleCancellationComplete}
        />
      )}
    </div>
  );
};

export default DashboardBookings;
