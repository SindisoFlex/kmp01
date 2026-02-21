
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const StaffProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
      </div>

      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The profile management feature is currently under development. Soon you'll be able to update your professional information here.
          </p>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p><strong>Username:</strong> {user?.name || 'Not available'}</p>
            <p><strong>Role:</strong> {user?.role || 'Staff'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffProfile;
