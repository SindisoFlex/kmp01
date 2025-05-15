
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Gallery, Award, Link as LinkIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const DashboardIndex: React.FC = () => {
  const { user } = useAuth();

  // Mock data for dashboard
  const upcomingBookings = [
    { id: 1, service: "Portrait Photography", date: "2025-06-01T10:00:00", status: "confirmed" },
    { id: 2, service: "Family Photoshoot", date: "2025-06-15T14:30:00", status: "pending" }
  ];
  
  const recentPhotos = [
    { id: 1, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", alt: "Portrait" },
    { id: 2, url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", alt: "Fashion" },
    { id: 3, url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80", alt: "Model" }
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-muted-foreground">Here's a summary of your activity and upcoming bookings.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Membership</CardTitle>
              <CardDescription>Current tier status</CardDescription>
            </div>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 capitalize">{user?.membershipTier || 'Free'}</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: '30%' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">300 more points until Silver tier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Points</CardTitle>
              <CardDescription>Your reward balance</CardDescription>
            </div>
            <div className="h-5 w-5 text-primary font-semibold">🏆</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.points || 0}</div>
            <p className="text-sm text-muted-foreground">Earn points with every booking!</p>
            <Button variant="link" className="p-0 mt-2" asChild>
              <Link to="/dashboard/points">View rewards</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Gallery</CardTitle>
              <CardDescription>Your photo collection</CardDescription>
            </div>
            <Gallery className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Photos</div>
            <p className="text-sm text-muted-foreground">From 3 sessions</p>
            <Button variant="link" className="p-0 mt-2" asChild>
              <Link to="/dashboard/gallery">View gallery</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Upcoming Bookings</CardTitle>
            <CardDescription>Your scheduled photography sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{booking.service}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(booking.date)}
                      </div>
                      <div className={`text-xs mt-1 ${
                        booking.status === 'confirmed' 
                          ? 'text-green-500 dark:text-green-400' 
                          : 'text-amber-500 dark:text-amber-400'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/bookings/${booking.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link to="/dashboard/bookings">
                    View all bookings
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">No upcoming bookings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule your next photography session
                </p>
                <Button asChild>
                  <Link to="/services">Book Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Photos</CardTitle>
            <CardDescription>Photos from your latest sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPhotos.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {recentPhotos.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-md border">
                      <AspectRatio ratio={1 / 1}>
                        <img 
                          src={photo.url} 
                          alt={photo.alt} 
                          className="h-full w-full object-cover transition-all hover:scale-105" 
                        />
                      </AspectRatio>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard/gallery">
                    View all photos
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-6">
                <Gallery className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">No photos yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your gallery will populate after your first photoshoot
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">New Booking</h3>
                <p className="text-sm text-muted-foreground">Schedule your next session</p>
              </div>
              <Button asChild>
                <Link to="/services">Book</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Refer a Friend</h3>
                <p className="text-sm text-muted-foreground">Earn 50 points per referral</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/dashboard/refer">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Share
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Download Photos</h3>
                <p className="text-sm text-muted-foreground">Get high-res images</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/dashboard/download">Download</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardIndex;
