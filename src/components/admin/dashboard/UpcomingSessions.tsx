
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const UpcomingSessions: React.FC = () => {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return <Card className="h-full"><CardContent className="pt-6"><Skeleton className="h-[200px]" /></CardContent></Card>;
  }
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription>
          Next 3 scheduled bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden overflow-y-auto">
        <div className="space-y-4">
          {stats?.upcomingSessions?.length > 0 ? stats.upcomingSessions.map((session: any) => (
            <div key={session.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between mb-1 flex-wrap gap-2">
                <p className="font-medium truncate">{session.category} - {session.user?.name || "Client"}</p>
                <Badge variant="outline" className="whitespace-nowrap">
                  {new Date(session.date_time).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex justify-between text-sm flex-wrap gap-2">
                <p className="text-muted-foreground truncate">{new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-muted-foreground truncate">{session.location || "TBD"}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center space-y-3 h-full min-h-[150px] text-center px-4">
              <p className="text-sm font-medium">No upcoming sessions</p>
              <p className="text-xs text-muted-foreground">All clear for now.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" size="sm">
          View all bookings <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingSessions;
