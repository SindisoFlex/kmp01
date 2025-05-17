
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Gift, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { determineTier, pointsToNextTier } from "@/utils/pointsUtils";
import MemberBenefits from "@/components/membership/MemberBenefits";
import ReferralSystem from "@/components/referral/ReferralSystem";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from '@/hooks/use-mobile';

const PointsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useTheme();
  const isMobile = useIsMobile();
  
  if (!user) return null;
  
  const currentTier = determineTier(user.points);
  const { nextTier, pointsNeeded } = pointsToNextTier(user.points);
  
  const pointsHistory = [
    { id: 'p1', amount: 15, description: 'Portrait session completed', date: '2023-05-12' },
    { id: 'p2', amount: 5, description: 'Review submitted', date: '2023-05-15' },
    { id: 'p3', amount: 10, description: 'Referral bonus', date: '2023-06-02' },
    { id: 'p4', amount: 8, description: 'Photo package purchased', date: '2023-06-18' },
    { id: 'p5', amount: 12, description: 'Event photography session', date: '2023-07-10' },
  ];
  
  return (
    <div className="container py-8 max-w-5xl animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">My Points & Benefits</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3 fancy-card">
          <CardHeader className="pb-4">
            <CardTitle>Points Overview</CardTitle>
            <CardDescription>Your current loyalty status and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-sm text-muted-foreground">Current Points</span>
                <h2 className="text-4xl font-bold">{user.points}</h2>
              </div>
              
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Current Tier</span>
                <h3 className="text-2xl font-bold capitalize">{currentTier}</h3>
              </div>
            </div>
            
            {nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress to {nextTier}</span>
                  <span className="text-primary">{pointsNeeded} points needed</span>
                </div>
                <Progress value={100 - (pointsNeeded / (pointsNeeded + user.points) * 100)} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="benefits" className="md:col-span-3" onValueChange={() => playSound('click')}>
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <TabsTrigger value="benefits" className="flex items-center justify-center">
              <Award className="mr-2 h-4 w-4" />
              Membership Benefits
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center justify-center">
              <Gift className="mr-2 h-4 w-4" />
              Points History
            </TabsTrigger>
            <TabsTrigger value="refer" className="flex items-center justify-center">
              <Users className="mr-2 h-4 w-4" />
              Refer Friends
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="benefits" className="pt-6 animate-fade-in">
            <MemberBenefits />
          </TabsContent>
          
          <TabsContent value="history" className="pt-6 animate-fade-in">
            <Card className="fancy-card">
              <CardHeader>
                <CardTitle>Points History</CardTitle>
                <CardDescription>
                  Track your points earning history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`grid ${isMobile ? 'grid-cols-6' : 'grid-cols-12'} text-xs font-medium text-muted-foreground mb-2`}>
                    <div className={`${isMobile ? 'col-span-2' : 'col-span-2'}`}>Date</div>
                    <div className={`${isMobile ? 'col-span-3' : 'col-span-7'}`}>Activity</div>
                    <div className={`${isMobile ? 'col-span-1' : 'col-span-3'} text-right`}>Points</div>
                  </div>
                  
                  <div className="space-y-2">
                    {pointsHistory.map(item => (
                      <div key={item.id} className={`grid ${isMobile ? 'grid-cols-6' : 'grid-cols-12'} py-2 border-b text-sm`}>
                        <div className={`${isMobile ? 'col-span-2' : 'col-span-2'} text-muted-foreground`}>{item.date}</div>
                        <div className={`${isMobile ? 'col-span-3' : 'col-span-7'}`}>{item.description}</div>
                        <div className={`${isMobile ? 'col-span-1' : 'col-span-3'} text-right font-medium text-primary`}>
                          +{item.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 text-sm">
                    <h4 className="font-medium mb-2">How to Earn More Points</h4>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Book photography sessions (5-15 points per session)</li>
                      <li>Refer friends to StudioX (10 points per successful referral)</li>
                      <li>Leave reviews of your sessions (5 points)</li>
                      <li>Purchase additional photo packages (1 point per R50 spent)</li>
                      <li>Engage with our social media (1 point per engagement)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="refer" className="pt-6 animate-fade-in">
            <ReferralSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PointsDashboard;
