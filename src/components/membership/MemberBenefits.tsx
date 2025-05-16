
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { determineTier, pointsToNextTier } from "@/utils/pointsUtils";

const MemberBenefits: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const currentTier = determineTier(user.points);
  const { nextTier, pointsNeeded } = pointsToNextTier(user.points);
  
  const benefitsByTier = {
    free: [
      "Basic account access",
      "Request quotes online",
      "Access to public portfolio"
    ],
    bronze: [
      "5% discount on photoshoots",
      "Access to basic editing tools",
      "Personal gallery access",
      "Priority support"
    ],
    silver: [
      "10% discount on photoshoots",
      "Access to premium editing tools",
      "Extended gallery storage (6 months)",
      "Prioritized booking slots"
    ],
    gold: [
      "15% discount on all services",
      "Access to all editing tools",
      "Extended gallery storage (12 months)",
      "Premium booking slots",
      "One free mini session per year"
    ],
    vip: [
      "20% discount on all services",
      "Unlimited access to all tools",
      "Lifetime gallery storage",
      "VIP booking slots",
      "Annual free photoshoot",
      "Personal photography consultant"
    ]
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Membership Benefits</h2>
        <p className="text-muted-foreground">
          Enjoy exclusive perks and rewards with your {currentTier} membership.
        </p>
      </div>
      
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Your Membership</CardTitle>
            <Badge className="capitalize" variant="secondary">{currentTier}</Badge>
          </div>
          <CardDescription>You have earned {user.points} loyalty points</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier}</span>
                <span className="text-primary">{pointsNeeded} points needed</span>
              </div>
              <Progress value={100 - (pointsNeeded / (pointsNeeded + user.points) * 100)} />
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Your Current Benefits:</h4>
            <ul className="space-y-1">
              {benefitsByTier[currentTier as keyof typeof benefitsByTier].map((benefit, index) => (
                <li key={index} className="flex items-baseline">
                  <span className="mr-2 text-primary">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        {nextTier && (
          <CardFooter className="border-t pt-4 flex-col items-start">
            <h4 className="font-medium mb-2">Unlock at {nextTier} tier:</h4>
            <ul className="space-y-1 text-muted-foreground">
              {benefitsByTier[nextTier as keyof typeof benefitsByTier]
                .filter(benefit => !benefitsByTier[currentTier as keyof typeof benefitsByTier].includes(benefit))
                .map((benefit, index) => (
                  <li key={index} className="flex items-baseline">
                    <span className="mr-2">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
            </ul>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default MemberBenefits;
