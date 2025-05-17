
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/components/ui/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  terms: z.boolean().refine(val => val === true, { message: "You must accept the terms" }),
  marketing: z.boolean().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const { register, socialLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationMethod, setRegistrationMethod] = useState<'form' | 'social' | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
      marketing: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setRegistrationMethod('form');
    try {
      await register(
        values.name,
        values.email,
        values.password,
        values.marketing
      );
      toast({
        title: `🎉 Welcome to StudioX, ${values.name.split(' ')[0]}!`,
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again or use a different method.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRegistrationMethod(null);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'whatsapp') => {
    setRegistrationMethod('social');
    setIsLoading(true);
    try {
      await socialLogin(provider);
      toast({
        title: "🎉 Welcome to StudioX!",
        description: "You've successfully signed up.",
      });
    } catch (error) {
      toast({
        title: "Social login failed",
        description: "Please try again or use email registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRegistrationMethod(null);
    }
  };

  return (
    <div className="space-y-6">
      {registrationMethod !== 'form' && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium mb-4">Sign Up with</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              type="button" 
              className="w-full" 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              {isLoading && registrationMethod === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              className="w-full" 
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              {isLoading && registrationMethod === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <Facebook className="h-5 w-5 mr-2 text-blue-600" />
              Facebook
            </Button>
          </div>
          <Button 
            variant="outline" 
            type="button" 
            className="w-full" 
            onClick={() => handleSocialLogin('whatsapp')}
            disabled={isLoading}
          >
            {isLoading && registrationMethod === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
            WhatsApp
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>
        </div>
      )}

      {registrationMethod !== 'social' && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I accept the <a href="#" className="text-primary hover:underline">Terms & Conditions</a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="marketing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to receive marketing communications
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default RegisterForm;
