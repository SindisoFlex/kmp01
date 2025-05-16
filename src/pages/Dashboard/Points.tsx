
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Share, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { determineTier, pointsToNextTier, pointsConfig } from "@/utils/pointsUtils";
import { useToast } from "@/hooks/use-toast";

const PointsDashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = React.useState<string>("");
  
  // Generate a referral code based on user info if not already set
  React.useEffect(() => {
    if (!referralCode && user) {
      const code = `${user.name.split(' ')[0].toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;
      setReferralCode(code);
    }
  }, [user, referralCode]);

  if (!user) return null;
  
  const currentTier = determineTier(user.points);
  const { nextTier, pointsNeeded } = pointsToNextTier(user.points);
  
  const tierPercentage = nextTier 
    ? ((user.points - pointsConfig.tiers[currentTier].min) / 
       (pointsConfig.tiers[nextTier].min - pointsConfig.tiers[currentTier].min)) * 100
    : 100;
  
  const shareReferral = () => {
    navigator.clipboard.writeText(`Join my favorite photo studio with my referral code: ${referralCode}`);
    toast({ 
      title: "Referral Link Copied", 
      description: "Share it with friends to earn points!"
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Points & Rewards</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Membership Status</CardTitle>
                <CardDescription>Your current tier and progress</CardDescription>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold capitalize">
                  {currentTier} Tier
                </h3>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {user.points} Points
                </span>
              </div>
              
              {nextTier ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{currentTier}</span>
                      <span>{nextTier}</span>
                    </div>
                    <Progress value={tierPercentage} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {pointsNeeded} more points until {nextTier} tier
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm">You've reached our highest membership tier! Enjoy all VIP benefits.</p>
              )}
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Tier Benefits:</h4>
                <ul className="space-y-1 text-sm">
                  {pointsConfig.tiers[currentTier].perks.map((perk, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Refer Friends & Earn</CardTitle>
            <CardDescription>
              Get 50 points for each friend who signs up and books a session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md flex items-center justify-between">
              <code className="text-sm font-mono">{referralCode}</code>
              <Button size="sm" onClick={shareReferral}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Share your unique referral code with friends</li>
                <li>They enter your code when registering</li>
                <li>When they book their first session, you earn 50 points</li>
                <li>They also get a 10% discount on their first booking</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">2 successful referrals</span>
              </div>
              <Button variant="outline" asChild>
                <Link to="/dashboard/referrals">View Details</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Points History</CardTitle>
          <CardDescription>Recent points earned and redeemed</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="earned">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="earned">Earned</TabsTrigger>
              <TabsTrigger value="redeemed">Redeemed</TabsTrigger>
            </TabsList>
            <TabsContent value="earned">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium">Booking: Portrait Session</p>
                    <p className="text-sm text-muted-foreground">May 10, 2025</p>
                  </div>
                  <span className="text-green-600 font-medium">+50 points</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium">Referral: John Smith</p>
                    <p className="text-sm text-muted-foreground">Apr 28, 2025</p>
                  </div>
                  <span className="text-green-600 font-medium">+50 points</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium">Booking: Family Package</p>
                    <p className="text-sm text-muted-foreground">Apr 15, 2025</p>
                  </div>
                  <span className="text-green-600 font-medium">+75 points</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="redeemed">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium">Discount Applied: 10%</p>
                    <p className="text-sm text-muted-foreground">May 12, 2025</p>
                  </div>
                  <span className="text-red-600 font-medium">-25 points</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium">Free Photo Edit</p>
                    <p className="text-sm text-muted-foreground">Apr 30, 2025</p>
                  </div>
                  <span className="text-red-600 font-medium">-15 points</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsDashboard;
