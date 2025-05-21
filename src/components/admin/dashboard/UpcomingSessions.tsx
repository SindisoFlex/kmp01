
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UpcomingSessions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription>
          Next 3 scheduled bookings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between mb-1">
                <p className="font-medium">Wedding Shoot - Cooper Family</p>
                <Badge variant="outline" className={
                  i === 1 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                >
                  {i === 1 ? "Tomorrow" : `In ${i} days`}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">May {15 + i}, 2025 · 2:00 PM</p>
                <p className="text-muted-foreground">Sarah Johnson</p>
              </div>
            </div>
          ))}
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
