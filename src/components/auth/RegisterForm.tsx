
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.241-.579-.486-.5-.668-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M20.52 3.449C12.831-3.268.521 1.375.461 11.94c-.02 1.5.295 2.993.872 4.377L.051 24l7.851-2.062a11.786 11.786 0 005.595 1.425h.005c7.82-.55 13.557-7.813 11.947-15.613-1.055-5.167-5.888-9.024-10.93-8.825l.002-.476zM11.9 21.386c-2.119-.125-4.188-.767-6.041-2.277l-.816-.478-6.039 1.584 1.663-5.924-.576-.906c-1.646-2.57-2.338-7.228.916-11.277C3.93 1.004 5.741-.006 7.7.15c-1.95 7.812 5.384 13.056 9.961 11.386-1.646 5.699-3.665 9.849-5.761 9.849v.001z" fill="#25D366"/>
            </svg>
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
