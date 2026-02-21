
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import StatsSummary from "@/components/admin/dashboard/StatsSummary";
import ActivityList from "@/components/admin/dashboard/ActivityList";
import StaffPerformance from "@/components/admin/dashboard/StaffPerformance";
import UpcomingSessions from "@/components/admin/dashboard/UpcomingSessions";
import RecentMessages from "@/components/admin/dashboard/RecentMessages";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, ArrowUpRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { useAdminDashboardStats } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 w-full max-w-full overflow-hidden p-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-[120px] w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

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
            {stats.pendingApprovals} pending
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link to="/admin/bookings">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsSummary stats={stats} />

      {/* New High-priority Items */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              Pending Approvals
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">{stats.pendingApprovals}</Badge>
            </CardTitle>
            <CardDescription>
              Bookings requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingBookingsList?.length > 0 ? stats.pendingBookingsList.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.category} {item.type}</p>
                    <p className="text-xs text-muted-foreground">{item.user?.name || "Client"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs">{item.date_time ? new Date(item.date_time).toLocaleDateString() : 'TBD'}</p>
                    <Link to={`/admin/bookings?id=${item.id}`} className="text-xs text-primary hover:underline">Review</Link>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No pending approvals</p>
              )}
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
              {stats.todayScheduleList?.length > 0 ? stats.todayScheduleList.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.category} {item.type}</p>
                    <p className="text-xs text-muted-foreground">{item.location || "TBD"}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {new Date(item.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No sessions scheduled for today</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t">
              <Link to="/admin/bookings" className="text-sm text-primary hover:underline flex items-center justify-end">
                Full schedule <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              Loyalty Program
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{stats.loyaltyMilestones} New</Badge>
            </CardTitle>
            <CardDescription>
              Tier advancement and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Mock Loyalty structure replaced with empty state until properly queried */}
              <p className="text-sm text-muted-foreground">No recent loyalty milestones</p>
            </div>
            <div className="mt-4 pt-3 border-t">
              <Link to="/admin/clients" className="text-sm text-primary hover:underline flex items-center justify-end">
                Manage clients <ArrowUpRight className="ml-1 h-3 w-3" />
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
        <RecentMessages unreadCount={stats.messagesUnread} />
        <QuickActions />
      </div>
    </div>
  );
};

export default AdminDashboard;
