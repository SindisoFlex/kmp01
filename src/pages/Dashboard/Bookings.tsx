
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Filter } from "lucide-react";

const DashboardBookings: React.FC = () => {
  // Mock data for bookings
  const bookings = [
    { 
      id: 1, 
      service: "Portrait Photography", 
      date: "2025-06-01T10:00:00", 
      status: "confirmed",
      location: "Studio",
      price: "$149.99"
    },
    { 
      id: 2, 
      service: "Family Photoshoot", 
      date: "2025-06-15T14:30:00", 
      status: "pending",
      location: "Central Park",
      price: "$199.99"
    },
    { 
      id: 3, 
      service: "Product Photography", 
      date: "2025-05-10T09:00:00", 
      status: "completed",
      location: "Studio",
      price: "$99.99"
    },
    { 
      id: 4, 
      service: "Wedding Photography", 
      date: "2025-04-20T16:00:00", 
      status: "completed",
      location: "Beach Resort",
      price: "$999.99"
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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
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
          <Link to="/services">New Booking</Link>
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
              {bookings.map((booking) => (
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
                        {booking.location} • {booking.price}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3 md:mt-0">
                    {booking.status === "completed" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/gallery">
                          View Photos
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't scheduled any photography sessions yet
              </p>
              <Button asChild>
                <Link to="/services">Book your first session</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardBookings;
