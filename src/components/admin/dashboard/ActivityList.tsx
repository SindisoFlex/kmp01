
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
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center min-w-0">
                <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                  i % 3 === 0 ? "bg-green-500" : 
                  i % 3 === 1 ? "bg-blue-500" : "bg-yellow-500"
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {i % 3 === 0 ? "New booking created" : 
                     i % 3 === 1 ? "Client profile updated" : 
                     "Gallery photos uploaded"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {i % 3 === 0 ? "Client #" + (100 + i) + " booked a portrait session" :
                     i % 3 === 1 ? "Staff member updated client information" :
                     "12 new photos added to client gallery"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                {i === 1 ? "Just now" : 
                 i === 2 ? "5m ago" :
                 i === 3 ? "1h ago" :
                 i === 4 ? "3h ago" : "Yesterday"}
              </p>
            </div>
          ))}
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
