import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Filter, RefreshCw } from "lucide-react";
import { getBookings } from "@/services/bookingService";
import { useAuth } from '@/contexts/AuthContext';
import type { Booking } from "@/types/booking";

const DashboardBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const rows = await getBookings(user.id);
      setBookings(rows);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setErrorMessage(`We could not load your bookings. Please refresh and try again. (${message})`);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;

    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date_time);
      return statusFilter === "upcoming" ? bookingDate >= now : bookingDate < now;
    });
  }, [bookings, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your confirmed and pending sessions.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>All</Button>
          <Button variant={statusFilter === "upcoming" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("upcoming")}>Upcoming</Button>
          <Button variant={statusFilter === "past" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("past")}>Past</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadBookings} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/dashboard/booking/new">New Booking</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>Latest booking activity synced from your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{booking.type}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(booking.date_time)}
                    </div>
                    <div className="flex items-center mt-1.5 space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {booking.location || "Location pending"} • R{Number(booking.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                    {String(booking.status).toLowerCase() === "completed" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/gallery">View Gallery</Link>
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" asChild>
                      <Link to="/dashboard/booking/new">Book Again</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-sm text-muted-foreground mb-4">You have not scheduled any sessions yet.</p>
              <Button asChild>
                <Link to="/dashboard/booking/new">Book your first session</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardBookings;
