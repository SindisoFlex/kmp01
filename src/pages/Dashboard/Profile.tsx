
import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { UserCheck } from "lucide-react";

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    bio: user?.bio || '',
    isBusinessAccount: user?.isBusinessAccount || false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isBusinessAccount: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically update the user profile via API
    console.log('Profile data to update:', formData);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile information.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email address"
              />
            </div>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input 
                  id="whatsapp" 
                  name="whatsapp" 
                  value={formData.whatsapp} 
                  onChange={handleChange} 
                  placeholder="Enter your WhatsApp number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us a little about yourself"
                className="resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="isBusinessAccount" 
                checked={formData.isBusinessAccount}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isBusinessAccount">This is a business account</Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle>Account Status</CardTitle>
          </div>
          <CardDescription>Your current membership status and settings.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membership Tier:</span>
              <span className="font-medium">{user?.membershipTier || 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created:</span>
              <span className="font-medium">January 15, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-medium">Today</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
