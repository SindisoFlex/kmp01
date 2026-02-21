
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

import { useAdminDashboardStats } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentMessagesProps {
  unreadCount?: number;
}

const RecentMessages: React.FC<RecentMessagesProps> = ({ unreadCount }) => {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return <Card className="h-full"><CardContent className="pt-6"><Skeleton className="h-[200px]" /></CardContent></Card>;
  }

  const displayCount = unreadCount ?? stats?.messagesUnread ?? 0;
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>
            Unread client communications
          </CardDescription>
        </div>
        <div className="flex flex-col items-center justify-center h-6 min-w-6 px-2 rounded-full bg-primary">
          <span className="text-xs font-medium text-white">
            {displayCount}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden overflow-y-auto">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3 h-full min-h-[150px] text-center px-4">
            <p className="text-sm font-medium">No recent messages</p>
            <p className="text-xs text-muted-foreground">Inbox is empty.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" size="sm">
          View all messages <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentMessages;
