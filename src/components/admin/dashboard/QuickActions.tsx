
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, User, Users } from "lucide-react";

const QuickActions: React.FC = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used administrator tools
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            <span className="truncate">Add New Client</span>
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            <span className="truncate">Manage Staff</span>
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="truncate">Schedule Session</span>
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="truncate">Send Announcement</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
