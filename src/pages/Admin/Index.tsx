
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import StatsSummary from "@/components/admin/dashboard/StatsSummary";
import ActivityList from "@/components/admin/dashboard/ActivityList";
import StaffPerformance from "@/components/admin/dashboard/StaffPerformance";
import UpcomingSessions from "@/components/admin/dashboard/UpcomingSessions";
import RecentMessages from "@/components/admin/dashboard/RecentMessages";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, ArrowUpRight, Users, UserCheck, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Sample data for the dashboard
const mockStats = {
  totalClients: 352,
  totalStaff: 8,
  activeBookings: 28,
  completedBookings: 1240,
  totalRevenue: "$24,320",
  newClientsThisMonth: 42,
  messagesUnread: 5,
  pendingApprovals: 7,
  loyaltyMilestones: 3
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-safe">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground text-safe">
            Welcome back, {user?.name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Bell className="h-3 w-3 mr-1" />
            {mockStats.pendingApprovals} pending
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link to="/admin/bookings">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsSummary stats={mockStats} />

      {/* New High-priority Items */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              Pending Approvals
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">{mockStats.pendingApprovals}</Badge>
            </CardTitle>
            <CardDescription>
              Bookings requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Wedding Photography", client: "Smith Family", date: "Tomorrow, 10:00 AM" },
                { name: "Product Shoot", client: "TechGear LLC", date: "May 24, 2:30 PM" },
                { name: "Corporate Headshots", client: "Finance Co", date: "May 25, 9:00 AM" },
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs">{item.date}</p>
                    <Link to="/admin/bookings" className="text-xs text-primary hover:underline">Review</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t">
              <Link to="/admin/bookings?filter=pending" className="text-sm text-primary hover:underline flex items-center justify-end">
                See all pending <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              Today's Schedule
              <CalendarCheck className="h-4 w-4 text-blue-500" />
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "10:00 AM", event: "Team Meeting", location: "Conference Room" },
                { time: "1:30 PM", event: "Client Consultation", location: "Studio A" },
                { time: "4:00 PM", event: "Equipment Check", location: "Storage Room" },
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.event}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{item.time}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t">
              <Link to="/admin/calendar" className="text-sm text-primary hover:underline flex items-center justify-end">
                Full schedule <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              Loyalty Program
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{mockStats.loyaltyMilestones} New</Badge>
            </CardTitle>
            <CardDescription>
              Points and referral activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { client: "James Wilson", action: "Reached Gold tier", points: "5,000 pts" },
                { client: "Maria Garcia", action: "New referral", points: "+500 pts" },
                { client: "Robert Chen", action: "Redeemed reward", points: "-2,500 pts" },
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.client}</p>
                    <p className="text-xs text-muted-foreground">{item.action}</p>
                  </div>
                  <Badge variant={i === 2 ? "destructive" : "success"} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{item.points}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t">
              <Link to="/admin/loyalty" className="text-sm text-primary hover:underline flex items-center justify-end">
                Manage loyalty program <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Performance */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ActivityList />
        </div>
        <div className="lg:col-span-3">
          <StaffPerformance />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <UpcomingSessions />
        <RecentMessages unreadCount={mockStats.messagesUnread} />
        <QuickActions />
      </div>
    </div>
  );
};

export default AdminDashboard;
