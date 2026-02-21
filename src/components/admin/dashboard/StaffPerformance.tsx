
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const StaffPerformance: React.FC = () => {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return <Card className="h-full"><CardContent className="pt-6"><Skeleton className="h-[200px]" /></CardContent></Card>;
  }
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>
          Completed bookings this month
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden overflow-y-auto">
        {stats?.staffMembers?.length > 0 ? stats.staffMembers.map((staff: any, i: number) => (
          <div key={staff.name || i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium flex-shrink-0">
                {staff.name ? staff.name.split(' ').map((n: string) => n[0]).join('') : "S"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{staff.name || "Staff Member"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Staff Team
                </p>
              </div>
            </div>
            <div className="text-sm font-medium flex-shrink-0 ml-2 text-muted-foreground">
              Active
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center space-y-3 h-full min-h-[150px] text-center px-4">
            <p className="text-sm font-medium">No staff data available</p>
            <p className="text-xs text-muted-foreground">Add staff members to track performance.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" size="sm">
          View full staff reports <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StaffPerformance;
