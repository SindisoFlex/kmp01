
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mocked data for visualization
const pageVisits = [
  { name: 'Home', views: 1240, visitors: 840, conversion: 3.2 },
  { name: 'Services', views: 980, visitors: 650, conversion: 4.8 },
  { name: 'Portfolio', views: 1100, visitors: 720, conversion: 2.1 },
  { name: 'Contact', views: 680, visitors: 450, conversion: 6.3 },
  { name: 'Membership', views: 520, visitors: 380, conversion: 7.5 },
  { name: 'Gallery', views: 890, visitors: 640, conversion: 5.2 },
];

const userActivity = [
  { month: 'Jan', newUsers: 65, activeUsers: 290 },
  { month: 'Feb', newUsers: 78, activeUsers: 310 },
  { month: 'Mar', newUsers: 82, activeUsers: 340 },
  { month: 'Apr', newUsers: 75, activeUsers: 360 },
  { month: 'May', newUsers: 92, activeUsers: 390 },
  { month: 'Jun', newUsers: 105, activeUsers: 420 },
];

const membershipDistribution = [
  { name: 'Free', value: 340 },
  { name: 'Bronze', value: 180 },
  { name: 'Silver', value: 120 },
  { name: 'Gold', value: 60 },
  { name: 'VIP', value: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const UserBehaviorInsights: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30days");
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>User Behavior Insights</CardTitle>
          <CardDescription>
            Analyze how users interact with your photography services
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="traffic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="traffic">Traffic Analysis</TabsTrigger>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
          </TabsList>
          
          <TabsContent value="traffic" className="space-y-4">
            <div className="h-[350px] mt-4">
              <h3 className="text-sm font-medium mb-2">Page Visits & Conversion</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pageVisits}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="views" fill="#8884d8" name="Page Views" />
                  <Bar yAxisId="left" dataKey="visitors" fill="#82ca9d" name="Unique Visitors" />
                  <Bar yAxisId="right" dataKey="conversion" fill="#ffc658" name="Conversion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Key Insights:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Membership page has the highest conversion rate at 7.5%</li>
                <li>• Home page receives the most traffic but has lower conversion</li>
                <li>• Contact page shows moderate traffic with good conversion (6.3%)</li>
                <li>• Consider optimizing Portfolio page which has low conversion despite high traffic</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="space-y-4">
            <div className="h-[350px] mt-4">
              <h3 className="text-sm font-medium mb-2">User Growth & Activity</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userActivity}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#8884d8" fill="#8884d8" name="Active Users" />
                  <Area type="monotone" dataKey="newUsers" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 my-4">
              <Card className="col-span-1">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">7.2 min</div>
                  <p className="text-xs text-muted-foreground">Avg. Session Duration</p>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">4.6</div>
                  <p className="text-xs text-muted-foreground">Pages Per Session</p>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">28%</div>
                  <p className="text-xs text-muted-foreground">Bounce Rate</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Behavior Patterns:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• User retention has improved by 12% over the last quarter</li>
                <li>• Mobile users spend 18% less time but convert 5% better</li>
                <li>• Gallery viewing is the most popular activity (42% of sessions)</li>
                <li>• 65% of users explore membership benefits before booking</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="membership" className="space-y-4">
            <div className="h-[350px] mt-4 flex">
              <div className="w-1/2">
                <h3 className="text-sm font-medium mb-2">Membership Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={membershipDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {membershipDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-1/2 pl-4">
                <h3 className="text-sm font-medium mb-4">Membership Insights</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Upgrade Rate</div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '38%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>38%</span>
                      <span>Free to Premium</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Retention Rate</div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: '72%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>72%</span>
                      <span>Annual Renewal</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Annual Revenue Growth</div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: '24%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>24%</span>
                      <span>Year-over-Year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Membership Recommendations:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Target Free tier users with personalized promotions to increase conversions</li>
                <li>• Consider adding more benefits to Silver tier to improve retention</li>
                <li>• VIP members show highest satisfaction - prioritize their experience</li>
                <li>• Most tier upgrades happen after successful gallery delivery</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserBehaviorInsights;
