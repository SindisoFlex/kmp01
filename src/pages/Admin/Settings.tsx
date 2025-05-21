
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Bell,
  Upload,
  Save,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Sample business data
  const [businessData, setBusinessData] = useState({
    name: "StudioX Photography",
    email: "contact@studiox.com",
    phone: "+27 71 234 5678",
    address: "123 Main Street, Cape Town, 8001",
    website: "www.studiox.com",
    logo: "/placeholder.svg",
    about: "Professional photography studio specializing in weddings, portraits, and commercial photography since 2015."
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    bookingAlerts: true,
    paymentAlerts: true,
    marketingEmails: false
  });
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    darkMode: false,
    accentColor: "#ea384c",
    compactMode: false,
    animationsEnabled: true,
    autoSave: true
  });

  const handleBusinessDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBusinessData({
      ...businessData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications]
    });
  };

  const handleThemeChange = (key: string, value: any) => {
    setThemeSettings({
      ...themeSettings,
      [key]: value
    });
  };

  const handleSaveSettings = (type: string) => {
    // In a real app, this would save to a database
    toast({
      title: "Settings saved",
      description: `Your ${type} settings have been updated successfully.`
    });
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business profile, preferences, and system settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details that will appear on invoices, emails, and the website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex flex-col items-center space-y-2 w-full sm:w-auto">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={businessData.logo} alt="Business Logo" />
                    <AvatarFallback className="text-xl">SX</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Change Logo
                  </Button>
                </div>
                <div className="flex-1 grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <div className="relative">
                        <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="businessName" 
                          name="name" 
                          value={businessData.name} 
                          onChange={handleBusinessDataChange} 
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={businessData.email} 
                          onChange={handleBusinessDataChange} 
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={businessData.phone} 
                          onChange={handleBusinessDataChange} 
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="website" 
                          name="website" 
                          value={businessData.website} 
                          onChange={handleBusinessDataChange} 
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="address" 
                        name="address" 
                        value={businessData.address} 
                        onChange={handleBusinessDataChange} 
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about">About Your Business</Label>
                    <Textarea 
                      id="about" 
                      name="about" 
                      value={businessData.about} 
                      onChange={handleBusinessDataChange} 
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => handleSaveSettings('profile')}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts from the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    id="emailNotifications" 
                    checked={notifications.emailNotifications}
                    onCheckedChange={() => handleNotificationChange('emailNotifications')}
                  />
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch 
                    id="smsNotifications" 
                    checked={notifications.smsNotifications}
                    onCheckedChange={() => handleNotificationChange('smsNotifications')}
                  />
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="bookingAlerts">Booking Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new and updated bookings
                    </p>
                  </div>
                  <Switch 
                    id="bookingAlerts" 
                    checked={notifications.bookingAlerts}
                    onCheckedChange={() => handleNotificationChange('bookingAlerts')}
                  />
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="paymentAlerts">Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for payments and invoices
                    </p>
                  </div>
                  <Switch 
                    id="paymentAlerts" 
                    checked={notifications.paymentAlerts}
                    onCheckedChange={() => handleNotificationChange('paymentAlerts')}
                  />
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates about new features and promotions
                    </p>
                  </div>
                  <Switch 
                    id="marketingEmails" 
                    checked={notifications.marketingEmails}
                    onCheckedChange={() => handleNotificationChange('marketingEmails')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => handleSaveSettings('notification')}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the admin dashboard looks and behaves.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark mode
                    </p>
                  </div>
                  <Switch 
                    id="darkMode" 
                    checked={themeSettings.darkMode}
                    onCheckedChange={(value) => handleThemeChange('darkMode', value)}
                  />
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your brand accent color
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="accentColor" 
                      type="color" 
                      value={themeSettings.accentColor}
                      onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                      className="w-12 h-8 p-0 overflow-hidden"
                    />
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Makes the interface more compact
                    </p>
                  </div>
                  <Switch 
                    id="compactMode" 
                    checked={themeSettings.compactMode}
                    onCheckedChange={(value) => handleThemeChange('compactMode', value)}
                  />
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animationsEnabled">Enable Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle UI animations on or off
                    </p>
                  </div>
                  <Switch 
                    id="animationsEnabled" 
                    checked={themeSettings.animationsEnabled}
                    onCheckedChange={(value) => handleThemeChange('animationsEnabled', value)}
                  />
                </div>
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSave">Auto-Save Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Save changes automatically while editing
                    </p>
                  </div>
                  <Switch 
                    id="autoSave" 
                    checked={themeSettings.autoSave}
                    onCheckedChange={(value) => handleThemeChange('autoSave', value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => handleSaveSettings('appearance')}>
                <Save className="h-4 w-4 mr-2" />
                Save Appearance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>
                Manage integrations with third-party services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { name: "Google Calendar", connected: true, icon: Calendar },
                  { name: "WhatsApp Business API", connected: false, icon: MessageSquare },
                  { name: "SMS Gateway", connected: true, icon: MessageCircle },
                  { name: "Payment Gateway", connected: true, icon: CreditCard },
                  { name: "Cloud Storage", connected: true, icon: Cloud }
                ].map((service, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <service.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.connected ? "Connected" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button variant={service.connected ? "outline" : "default"} size="sm">
                        {service.connected ? "Configure" : "Connect"}
                      </Button>
                    </div>
                    {index < 4 && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Integration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;

// Missing types import
import { MessageSquare, MessageCircle, CreditCard, Cloud, Plus } from "lucide-react";
