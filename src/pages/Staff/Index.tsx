
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, ClipboardList, User, Bell, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sample data for the charts
const mockStats = {
  todaysBookings: 2,
  weeklyBookings: 8,
  completedBookings: 24,
  assignedClients: 18,
  pendingTasks: 5,
  unreadMessages: 3
};

const StaffDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.name?.split(' ')[0]}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.todaysBookings} sessions</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.weeklyBookings} this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.assignedClients}</div>
            <p className="text-xs text-muted-foreground">
              Active client assignments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Requires your attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              From clients and admin
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>
              Your scheduled photography sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  client: "Johnsons Family",
                  type: "Family Portrait",
                  date: "Today, 2:00 PM",
                  location: "Studio A" 
                },
                { 
                  client: "Emma Smith",
                  type: "Professional Headshots",
                  date: "Today, 4:30 PM",
                  location: "Studio B" 
                },
                { 
                  client: "Robert & Julia",
                  type: "Engagement Photos", 
                  date: "Tomorrow, 10:00 AM",
                  location: "Central Park" 
                },
                { 
                  client: "Cooper Wedding",
                  type: "Wedding Ceremony", 
                  date: "May 17, 12:00 PM",
                  location: "St. Mary's Church" 
                },
              ].map((session, i) => (
                <div key={i} className="flex items-start space-x-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded p-2 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{session.client}</p>
                      <Badge variant={i < 2 ? "default" : "outline"}>
                        {i < 2 ? "Today" : i === 2 ? "Tomorrow" : "Upcoming"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                      <p className="text-xs text-muted-foreground">{session.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" size="sm">
              View full schedule <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: "Upload Cooper wedding photos", priority: "high", due: "Today" },
                { task: "Review Johnsons family portrait edits", priority: "medium", due: "Tomorrow" },
                { task: "Prepare lighting setup for studio session", priority: "medium", due: "Today" },
                { task: "Complete Smith headshot touch-ups", priority: "high", due: "May 17" },
                { task: "Submit timesheet for approval", priority: "low", due: "May 18" }
              ].map((task, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    task.priority === "high" ? "bg-red-500" : 
                    task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                  }`} />
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-sm">{task.task}</p>
                    <Badge variant="outline" className="text-xs">
                      Due: {task.due}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" size="sm">
              View all tasks <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              Communications from clients and admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  from: "Admin",
                  message: "Please submit your availability for next month by Friday.",
                  time: "10m ago",
                  unread: true 
                },
                { 
                  from: "Emma Smith",
                  message: "Looking forward to our session today! Are we still on for 4:30?",
                  time: "1h ago",
                  unread: true 
                },
                { 
                  from: "Robert Brown",
                  message: "Thanks for the amazing engagement photos! We love them.",
                  time: "2d ago",
                  unread: false 
                },
              ].map((msg, i) => (
                <div key={i} className="flex items-start space-x-3 border-b pb-4 last:border-0 last:pb-0">
                  <div className={`min-w-8 h-8 rounded-full ${
                    msg.from === "Admin" ? "bg-primary" : "bg-primary/20"
                  } flex items-center justify-center ${
                    msg.from === "Admin" ? "text-primary-foreground" : "text-primary"
                  } font-medium`}>
                    {msg.from[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium text-sm">{msg.from}</p>
                      {msg.unread && (
                        <span className="ml-2 w-2 h-2 rounded-full bg-primary"></span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{msg.message}</p>
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
            <CardTitle>Client Feedback</CardTitle>
            <CardDescription>
              Recent ratings and reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold">4.8</div>
              <div className="flex items-center justify-center">
                {Array(5).fill(0).map((_, i) => (
                  <svg 
                    key={i} 
                    className={`h-5 w-5 ${i < 4 ? "text-yellow-500" : "text-yellow-400"}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From 58 client reviews
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { 
                  name: "Sarah M.",
                  rating: 5,
                  comment: "Absolutely amazing work! Captured our wedding day perfectly." 
                },
                { 
                  name: "John D.",
                  rating: 4,
                  comment: "Great family portraits, though the session ran a bit long." 
                },
              ].map((review, i) => (
                <div key={i} className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.name}</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, j) => (
                        <svg 
                          key={j} 
                          className={`h-4 w-4 ${j < review.rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" size="sm">
              View all feedback <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
