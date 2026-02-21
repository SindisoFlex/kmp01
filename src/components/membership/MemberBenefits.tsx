
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { determineTier } from "@/utils/loyaltyUtils";
import { useToast } from "@/hooks/use-toast";

const MemberBenefits: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  const bookingsCount = user.loyaltyState?.individual_completed_bookings || 0;
  const currentTier = determineTier(bookingsCount);

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

  const showSmartSuggestion = () => {
    let suggestion = "";

    switch (currentTier) {
      case 'free':
        suggestion = "Book your first session to unlock Bronze tier benefits!";
        break;
      case 'bronze':
        suggestion = `Keep booking to reach Silver tier and unlock deeper discounts!`;
        break;
      case 'silver':
        suggestion = `You're close to Gold! Completing more sessions boosts your status.`;
        break;
      case 'gold':
        suggestion = `You're among our top clients. Just a few more sessions to reach VIP!`;
        break;
      case 'vip':
        suggestion = `As a VIP member, you have lifetime gallery storage and our maximum discount.`;
        break;
      default:
        suggestion = "Complete sessions to unlock more membership benefits.";
    }

    toast({
      title: "Membership Tip",
      description: suggestion,
    });
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
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
          <CardDescription>You have completed {bookingsCount} bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(['free', 'bronze', 'silver', 'gold', 'vip'] as const).map((tier) => (
          <Card key={tier} className={`${tier === currentTier ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
              <Badge variant={tier === currentTier ? "default" : "outline"} className="mb-2 capitalize">
                {tier}
              </Badge>
              <CardTitle className="text-base">{tier.charAt(0).toUpperCase() + tier.slice(1)}</CardTitle>
              <CardDescription className="text-xs">
                {
                  tier === 'free' ? 'Get started' :
                    tier === 'bronze' ? '1+ bookings' :
                      tier === 'silver' ? '3+ bookings' :
                        tier === 'gold' ? '5+ bookings' : '10+ bookings'
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
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MemberBenefits;
