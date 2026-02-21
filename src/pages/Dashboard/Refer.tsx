import React, { useEffect, useState } from 'react';
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Copy, Mail, Share2, Trophy, Users } from "lucide-react";
import { getReferralLinkForUser, getReferralStats, type ReferralStats } from "@/services/referralService";

const ReferralPage: React.FC = () => {
  const { user } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  const referralCode = user?.id || "";
  const referralLink = user?.id ? getReferralLinkForUser(user.id) : "";

  useEffect(() => {
    const loadReferralData = async () => {
      if (!user?.id) {
        setErrorMessage("You must be signed in to view referral data.");
        setReferralStats(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const stats = await getReferralStats(user.id);
        setReferralStats(stats);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        setErrorMessage(`Unable to load referral stats. Please refresh and try again. (${message})`);
        setReferralStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadReferralData();
  }, [user?.id]);

  const copyToClipboard = () => {
    const valueToCopy = referralLink || referralCode;
    navigator.clipboard.writeText(valueToCopy)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "Copied to clipboard",
          description: "Your referral link has been copied to clipboard.",
        });
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Clipboard permission denied. Please copy the code manually.",
          variant: "destructive"
        });
      });
  };

  const shareViaWhatsApp = () => {
    const message = `Join Kasilam Media production and get exclusive photography deals! Sign up with my referral link: ${referralLink || window.location.origin}`;
    const encodedMessage = encodeURIComponent(message);
    const popup = window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    if (!popup) {
      toast({
        title: "Unable to open WhatsApp",
        description: "Your browser blocked the popup. Please allow popups and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Refer a Friend</h1>

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Your Referral Code</CardTitle>
          </div>
          <CardDescription>Share this code with friends and advance your loyalty tier for each successful referral.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={referralCode || "Unavailable"}
              readOnly
              className="font-medium text-center"
            />
            <Button variant="outline" onClick={copyToClipboard}>
              {copySuccess ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-3">
            <Input
              value={referralLink || "Referral link unavailable"}
              readOnly
              className="text-xs"
            />
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
                <a href={`mailto:?subject=${encodeURIComponent("Join Kasilam Media production")}&body=${encodeURIComponent(`Hey! Join Kasilam Media production and get exclusive photography deals! Sign up with my referral link: ${referralLink}`)}`}>
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
          <CardDescription>Track your referral progress and tier boosts.</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center text-muted-foreground">Loading referral stats...</div>
          ) : !referralStats ? (
            <div className="py-4 text-center text-muted-foreground">No referral stats available yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm">Total Referrals</p>
                <p className="text-2xl font-bold">{referralStats.total}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm">Earned Tokens</p>
                <p className="text-2xl font-bold">{referralStats.earnedTokens}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm">Pending</p>
                <p className="text-2xl font-bold">{referralStats.pending}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm">Converted</p>
                <p className="text-2xl font-bold">{referralStats.converted}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralPage;
