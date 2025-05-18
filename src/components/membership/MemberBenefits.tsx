
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { determineTier, pointsToNextTier } from "@/utils/pointsUtils";
import { useToast } from "@/hooks/use-toast";

const MemberBenefits: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!user) return null;
  
  const currentTier = determineTier(user.points);
  const { nextTier, pointsNeeded } = pointsToNextTier(user.points);
  
  // Enhanced benefits with icons and detailed descriptions
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

  // Show a smart suggestion based on the user's current tier
  const showSmartSuggestion = () => {
    let suggestion = "";
    
    switch(currentTier) {
      case 'free':
        suggestion = "Book your first session to earn points and unlock Bronze tier benefits!";
        break;
      case 'bronze':
        suggestion = `You're ${pointsNeeded} points away from Silver tier. Refer a friend to earn 10 points!`;
        break;
      case 'silver':
        suggestion = `Book a family photography package to earn enough points for Gold tier benefits.`;
        break;
      case 'gold':
        suggestion = `You're close to our exclusive VIP tier! Complete a premium booking to reach it.`;
        break;
      case 'vip':
        suggestion = `As a VIP member, you have access to all our premium features. Enjoy your benefits!`;
        break;
      default:
        suggestion = "Earn points with every session to unlock more membership benefits.";
    }
    
    toast({
      title: "Membership Tip",
      description: suggestion,
    });
  };
  
  // Get a color based on the tier
  const getTierColor = (tier: string): string => {
    switch(tier) {
      case 'bronze': return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
      case 'silver': return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      case 'gold': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'vip': return 'bg-purple-600/10 text-purple-600 border-purple-600/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Membership Benefits</h2>
          <button 
            onClick={showSmartSuggestion}
            className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Lightbulb className="mr-1 h-4 w-4" />
            Smart Tip
          </button>
        </div>
        <p className="text-muted-foreground">
          Enjoy exclusive perks and rewards with your {currentTier} membership.
        </p>
      </div>
      
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Your Membership</CardTitle>
            <Badge className={`capitalize ${getTierColor(currentTier)}`}>{currentTier}</Badge>
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(['free', 'bronze', 'silver', 'gold', 'vip'] as const).map((tier) => (
          <Card key={tier} className={`${tier === currentTier ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
              <Badge variant={tier === currentTier ? "default" : "outline"} className="mb-2 capitalize">
                {tier}
              </Badge>
              <CardTitle className="text-base">{
                tier === 'free' ? 'Basic' :
                tier === 'bronze' ? 'Bronze' :
                tier === 'silver' ? 'Silver' :
                tier === 'gold' ? 'Gold' : 'VIP'
              }</CardTitle>
              <CardDescription className="text-xs">
                {
                  tier === 'free' ? 'Get started' :
                  tier === 'bronze' ? '1+ points' :
                  tier === 'silver' ? '51+ points' :
                  tier === 'gold' ? '101+ points' : '251+ points'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs pt-0">
              <ul className="space-y-1">
                {benefitsByTier[tier].slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-baseline">
                    <span className="mr-1 text-primary text-xs">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
                {benefitsByTier[tier].length > 3 && (
                  <li className="text-muted-foreground">+{benefitsByTier[tier].length - 3} more benefits</li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MemberBenefits;
