
import React from "react";
import { BarChart3, Users, Calendar, User } from "lucide-react";
import StatsCard from "./StatsCard";

interface StatsSummaryProps {
  stats: {
    totalClients: number;
    totalStaff: number;
    activeBookings: number;
    completedBookings: number;
    totalRevenue: string;
    newClientsThisMonth: number;
  };
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Clients"
        value={stats.totalClients}
        description={`+${stats.newClientsThisMonth} this month`}
        icon={User}
      />
      
      <StatsCard
        title="Staff Members"
        value={stats.totalStaff}
        description="All active personnel"
        icon={Users}
      />
      
      <StatsCard
        title="Active Bookings"
        value={stats.activeBookings}
        description={`${stats.completedBookings} completed all-time`}
        icon={Calendar}
      />
      
      <StatsCard
        title="Total Revenue"
        value={stats.totalRevenue}
        description="Year to date"
        icon={BarChart3}
      />
    </div>
  );
};

export default StatsSummary;
