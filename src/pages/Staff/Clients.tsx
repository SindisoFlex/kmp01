
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

const StaffClients = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Clients</h1>
      </div>

      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The client management feature is currently under development. Soon you'll be able to view and manage your client relationships here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffClients;
