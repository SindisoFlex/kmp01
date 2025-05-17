
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import StatsSummary from "@/components/admin/dashboard/StatsSummary";
import ActivityList from "@/components/admin/dashboard/ActivityList";
import StaffPerformance from "@/components/admin/dashboard/StaffPerformance";
import UpcomingSessions from "@/components/admin/dashboard/UpcomingSessions";
import RecentMessages from "@/components/admin/dashboard/RecentMessages";
import QuickActions from "@/components/admin/dashboard/QuickActions";

// Sample data for the dashboard
const mockStats = {
  totalClients: 352,
  totalStaff: 8,
  activeBookings: 28,
  completedBookings: 1240,
  totalRevenue: "$24,320",
  newClientsThisMonth: 42,
  messagesUnread: 5
};

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.name?.split(' ')[0]}
        </p>
      </div>

      {/* Statistics Cards */}
      <StatsSummary stats={mockStats} />

      {/* Activity and Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityList />
        <StaffPerformance />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingSessions />
        <RecentMessages unreadCount={mockStats.messagesUnread} />
        <QuickActions />
      </div>
    </div>
  );
};

export default AdminDashboard;
