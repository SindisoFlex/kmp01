
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface AuthDialogProps {
  triggerElement?: React.ReactNode;
  defaultTab?: 'login' | 'register';
}

const AuthDialog: React.FC<AuthDialogProps> = ({ 
  triggerElement,
  defaultTab = 'login'
}) => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // If user is already authenticated, don't show the dialog
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement || <Button>Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome to StudioX</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to access your account or create a new one
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
