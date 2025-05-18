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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Share2, Clipboard, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ReferralSystem: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Generate a unique referral code for the current user
  const referralCode = user ? `${user.name.split(' ')[0]}${user.id.substring(0, 6)}`.toUpperCase() : "STUDIOX";
  const referralUrl = `${window.location.origin}/register?referral=${referralCode}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleEmailInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the email through a backend service
    toast({
      title: "Invitation Sent!",
      description: `Referral invitation sent to ${email}`,
    });
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
    setEmail("");
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join StudioX Photography',
          text: `Check out StudioX Photography! Use my referral code ${referralCode} for special benefits.`,
          url: referralUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Refer Friends & Earn Points</CardTitle>
        <CardDescription>
          Invite your friends and family to StudioX Photography and earn 10 points for each successful referral.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Referral Link</TabsTrigger>
            <TabsTrigger value="email">Email Invite</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Input 
                  readOnly 
                  value={referralUrl} 
                  className="bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={handleShare} 
                  className="w-full"
                  variant="default"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Referral Link
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailInvite} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Friend's Email Address
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button 
                    type="submit"
                    variant="default"
                    className="flex-shrink-0"
                    disabled={!email || inviteSent}
                  >
                    {inviteSent ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Your friend will receive an email with your referral link.</p>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="qr">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {/* In a real app, this would be a dynamically generated QR code */}
                <QrCode className="h-48 w-48 text-primary" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Scan this QR code to visit StudioX with your referral code: <span className="font-bold">{referralCode}</span>
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">How referrals work</h4>
          <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
            <li>Share your unique referral link with friends</li>
            <li>When they sign up using your link, they'll be connected to your account</li>
            <li>Once they complete their first booking, you'll receive 10 points</li>
            <li>There's no limit to how many friends you can refer!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSystem;
