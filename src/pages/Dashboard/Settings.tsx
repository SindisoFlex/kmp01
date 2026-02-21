
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  Bell, 
  Lock, 
  Mail, 
  Phone, 
  Shield, 
  UserCog
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  
  const handleNotificationToggle = (type: string, enabled: boolean) => {
    console.log(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`);
    toast({
      title: "Settings Updated",
      description: `${type} notifications ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };
  
  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email inbox for instructions to reset your password.",
    });
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailBooking" className="font-normal">Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Receive emails when your booking is confirmed</p>
                  </div>
                  <Switch 
                    id="emailBooking" 
                    defaultChecked 
                    onCheckedChange={(checked) => handleNotificationToggle('Booking confirmation email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailGallery" className="font-normal">Gallery Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive emails when new photos are added to your gallery</p>
                  </div>
                  <Switch 
                    id="emailGallery" 
                    defaultChecked 
                    onCheckedChange={(checked) => handleNotificationToggle('Gallery update email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailMarketing" className="font-normal">Marketing & Promotions</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and special offers</p>
                  </div>
                  <Switch 
                    id="emailMarketing" 
                    onCheckedChange={(checked) => handleNotificationToggle('Marketing email', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">SMS Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsReminder" className="font-normal">Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive text reminders before your appointments</p>
                  </div>
                  <Switch 
                    id="smsReminder" 
                    defaultChecked 
                    onCheckedChange={(checked) => handleNotificationToggle('Appointment reminder SMS', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsUpdates" className="font-normal">Booking Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive text updates about your bookings</p>
                  </div>
                  <Switch 
                    id="smsUpdates" 
                    defaultChecked 
                    onCheckedChange={(checked) => handleNotificationToggle('Booking update SMS', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Password</h3>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your password was last changed on January 15, 2025</p>
                  <Button onClick={handlePasswordReset}>
                    <Lock className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactor" className="font-normal">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="twoFactor" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Login Sessions</h3>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">You're currently logged in on 1 device</p>
                  <Button variant="outline">Manage Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                <CardTitle>Account Preferences</CardTitle>
              </div>
              <CardDescription>Manage your account preferences and contact information.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Contact Information</h3>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{user?.email || 'No email address'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{user?.phone || 'No phone number'}</p>
                  </div>
                  <Button variant="outline" className="mt-3" asChild>
                    <a href="/dashboard/profile">Update Contact Information</a>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Language & Region</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="language" className="font-normal">Language</Label>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                  <div>
                    <select id="language" className="rounded-md border border-input bg-background px-3 py-2">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Privacy</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="privateProfile" className="font-normal">Private Profile</Label>
                    <p className="text-sm text-muted-foreground">Hide your profile from other users</p>
                  </div>
                  <Switch id="privateProfile" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataCollection" className="font-normal">Data Collection</Label>
                    <p className="text-sm text-muted-foreground">Allow us to collect anonymous usage data</p>
                  </div>
                  <Switch id="dataCollection" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
