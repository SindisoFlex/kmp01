
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const StaffPerformance: React.FC = () => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>
          Completed bookings this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {["Jane Smith", "Alex Brown", "Michael Lee", "Sarah Johnson"].map((name, i) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i === 0 ? "Senior Photographer" : 
                     i === 1 ? "Lighting Specialist" :
                     i === 2 ? "Junior Photographer" : "Assistant"}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium">
                {i === 0 ? "24" : 
                 i === 1 ? "18" :
                 i === 2 ? "15" : "12"} bookings
              </div>
            </div>
          ))}
        </div>
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
