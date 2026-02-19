import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Copy, Mail, Share2, Trophy, Users } from "lucide-react";

const ReferralPage: React.FC = () => {
  const { user } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);

  // Mock referral code - in a real app, this would come from the user's data
  const referralCode = "KMP" + (user?.id || "X123");

  // Mock referral stats
  const referralStats = {
    total: 3,
    pending: 1,
    completed: 2,
    points: 100
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "Copied to clipboard",
          description: "Your referral code has been copied to clipboard.",
        });
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually.",
          variant: "destructive"
        });
      });
  };

  const shareViaWhatsApp = () => {
    const message = `Join Kasilam Media production and get exclusive photography deals! Use my referral code: ${referralCode}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Refer a Friend</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Your Referral Code</CardTitle>
          </div>
          <CardDescription>Share this code with friends and earn 50 points for each successful referral.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={referralCode}
              readOnly
              className="font-medium text-center"
            />
            <Button variant="outline" onClick={copyToClipboard}>
              {copySuccess ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="w-full">
            <h3 className="font-medium mb-2">Share via</h3>
            <div className="flex gap-2">
              <Button className="w-full" onClick={shareViaWhatsApp}>
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:?subject=Join%20Kasilam%20Media%20production&body=Hey!%20Join%20Kasilam%20Media%20production%20and%20get%20exclusive%20photography%20deals!%20Use%20my%20referral%20code:%20KMP123">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle>Your Referral Stats</CardTitle>
          </div>
          <CardDescription>Track your referral progress and rewards.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Total Referrals</p>
              <p className="text-2xl font-bold">{referralStats.total}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Points Earned</p>
              <p className="text-2xl font-bold">{referralStats.points}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Pending</p>
              <p className="text-2xl font-bold">{referralStats.pending}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Completed</p>
              <p className="text-2xl font-bold">{referralStats.completed}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralPage;
