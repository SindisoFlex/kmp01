
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import UserBehaviorInsights from "@/components/admin/analytics/UserBehaviorInsights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, LineChart, Users, CreditCard } from "lucide-react";

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Data insights for {user?.name?.split(' ')[0]}
        </p>
      </div>

      <Tabs defaultValue="behavior" className="w-full">
        <TabsList>
          <TabsTrigger value="behavior" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            User Behavior
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Content Performance
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center">
            <LineChart className="mr-2 h-4 w-4" />
            Marketing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="behavior" className="space-y-6">
          <UserBehaviorInsights />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>Where your users are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: "Direct", visits: 420, conversion: 3.8 },
                    { source: "Organic Search", visits: 380, conversion: 2.6 },
                    { source: "Referral", visits: 320, conversion: 4.1 },
                    { source: "Social Media", visits: 290, conversion: 3.5 },
                  ].map((item) => (
                    <div key={item.source} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{item.source}</div>
                        <div className="text-xs text-muted-foreground">{item.visits} visits</div>
                      </div>
                      <div className="text-sm font-medium">{item.conversion}% conv.</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Journey</CardTitle>
                <CardDescription>Common paths through your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { path: "Home → Services → Contact", freq: "32%", value: "High" },
                    { path: "Portfolio → Gallery → Membership", freq: "24%", value: "Medium" },
                    { path: "Home → Membership → Services", freq: "18%", value: "High" },
                    { path: "Direct to Contact", freq: "14%", value: "Low" },
                  ].map((item) => (
                    <div key={item.path} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{item.path}</div>
                        <div className="text-xs text-muted-foreground">{item.freq} of users</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        item.value === "High" ? "bg-green-100 text-green-800" :
                        item.value === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {item.value} value
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Revenue analytics will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Content performance analytics will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Analytics</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Marketing analytics will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
