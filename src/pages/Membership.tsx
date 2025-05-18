import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { determineTier, pointsToNextTier } from "@/utils/pointsUtils";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from '@/components/auth/AuthDialog';
import PageLayout from "@/components/layout/PageLayout";
import { Shield, Award, Star } from 'lucide-react';

const MembershipPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("benefits");
  
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container max-w-3xl mx-auto py-12">
          <Card className="border-2 border-dashed border-primary/30">
            <CardHeader>
              <CardTitle className="text-center">Unlock Exclusive Benefits</CardTitle>
              <CardDescription className="text-center">
                Create an account to view membership benefits and track your progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <AuthDialog triggerElement={<Button size="lg">Sign Up & Explore</Button>} />
            </CardContent>
            <CardFooter className="text-center">
              Already have an account? <AuthDialog triggerElement={<Button variant="link">Log In</Button>} />
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
  if (!user) {
    return (
      <PageLayout>
        <div className="container max-w-3xl mx-auto py-12">
          <Card>
            <CardContent>
              <p className="text-center">Loading membership information...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
  const currentTier = determineTier(user.points);
  const { nextTier, pointsNeeded } = pointsToNextTier(user.points);
  
  return (
    <PageLayout>
      <div className="container max-w-5xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {currentTier === 'free' ? 'Unlock More Benefits' : 'Your Membership'}
            </CardTitle>
            <CardDescription>
              Explore the benefits of being a StudioX member and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="benefits" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="benefits">
                  <Shield className="mr-2 h-4 w-4" />
                  Benefits
                </TabsTrigger>
                <TabsTrigger value="progress">
                  <Award className="mr-2 h-4 w-4" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="perks">
                  <Star className="mr-2 h-4 w-4" />
                  Perks
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="benefits" className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Membership Tiers</h3>
                  <p className="text-muted-foreground">
                    As you earn more points, you'll unlock higher membership tiers with exclusive benefits.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>Free</CardTitle>
                      <CardDescription>Basic Access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Request quotes online</p>
                      <p>Access to public portfolio</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-100/50">
                    <CardHeader>
                      <CardTitle>Bronze</CardTitle>
                      <CardDescription>1+ points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>5% discount on photoshoots</p>
                      <p>Access to basic editing tools</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-100/50">
                    <CardHeader>
                      <CardTitle>Silver</CardTitle>
                      <CardDescription>51+ points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>10% discount on photoshoots</p>
                      <p>Access to premium editing tools</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Your Progress</h3>
                  <p className="text-muted-foreground">
                    Track your progress towards the next membership tier.
                  </p>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Current Tier: {currentTier}</CardTitle>
                    <CardDescription>You have {user.points} points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {nextTier ? (
                      <>
                        <div className="mb-4">
                          <div className="flex justify-between">
                            <span>Progress to {nextTier}</span>
                            <span>{pointsNeeded} points needed</span>
                          </div>
                          <Progress value={100 - (pointsNeeded / (pointsNeeded + user.points) * 100)} />
                        </div>
                        <p>Keep earning points to unlock exclusive benefits!</p>
                      </>
                    ) : (
                      <p>You've reached the highest membership tier!</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="perks" className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Exclusive Perks</h3>
                  <p className="text-muted-foreground">
                    Enjoy these perks as a StudioX member.
                  </p>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Discounts</CardTitle>
                    <CardDescription>Enjoy discounts on photoshoots and services.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>5% off all photoshoots (Bronze)</p>
                    <p>10% off all photoshoots (Silver)</p>
                    <p>15% off all services (Gold)</p>
                    <p>20% off all services (VIP)</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MembershipPage;
