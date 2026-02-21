
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const ActivityList: React.FC = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          Latest actions across the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden overflow-y-auto">
        <div className="flex flex-col items-center justify-center space-y-3 h-full min-h-[150px] text-center px-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <p className="text-sm font-medium">Activity Logging Inactive</p>
          <p className="text-xs text-muted-foreground">
            Platform audit logs will appear here once the events system is fully integrated.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" size="sm">
          View all activity <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActivityList;
