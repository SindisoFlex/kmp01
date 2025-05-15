import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Users, Calendar, User, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sample data for the charts
const mockStats = {
  totalClients: 352,
  totalStaff: 8,
  activeBookings: 28,
  completedBookings: 1240,
  totalRevenue: "$24,320",
  newClientsThisMonth: 42,
  messagesUnread: 5
};

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.name?.split(' ')[0]}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{mockStats.newClientsThisMonth} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              All active personnel
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.completedBookings} completed all-time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Year to date
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      i % 3 === 0 ? "bg-green-500" : 
                      i % 3 === 1 ? "bg-blue-500" : "bg-yellow-500"
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {i % 3 === 0 ? "New booking created" : 
                         i % 3 === 1 ? "Client profile updated" : 
                         "Gallery photos uploaded"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i % 3 === 0 ? "Client #" + (100 + i) + " booked a portrait session" :
                         i % 3 === 1 ? "Staff member updated client information" :
                         "12 new photos added to client gallery"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>
                Unread client communications
              </CardDescription>
            </div>
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary">
              <span className="text-xs font-medium text-white">
                {mockStats.messagesUnread}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-2 border-b pb-4 last:border-0 last:pb-0">
                  <div className="min-w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {i === 1 ? "Alice Johnson" : 
                       i === 2 ? "Bob Smith" : "Carol Williams"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {i === 1 ? "I'd like to discuss my wedding photoshoot plans with you. Can we schedule a call?" : 
                       i === 2 ? "When will my family portrait gallery be ready? I'm excited to see the photos!" : 
                       "Thanks for the quick response. I'll check the contract and get back to you tomorrow."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {i === 1 ? "5m ago" : 
                       i === 2 ? "1h ago" : "2h ago"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" size="sm">
              View all messages <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used administrator tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Add New Client
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Manage Staff
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
