import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login, socialLogin, resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'form' | 'social' | null>(null);

  const showGoogle = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';
  const showFacebook = import.meta.env.VITE_ENABLE_FACEBOOK_AUTH === 'true';
  const showWhatsapp = false; // Always false for now as it's not supported natively
  const showSocialSection = showGoogle || showFacebook || showWhatsapp;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoginMethod('form');
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      toast({
        title: "Login successful",
        description: "Welcome back to Kasilam Media production!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please check your credentials and try again.";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoginMethod(null);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'whatsapp') => {
    setLoginMethod('social');
    setIsLoading(true);
    try {
      await socialLogin(provider);
      toast({
        title: "Login successful",
        description: "Welcome back to Kasilam Media production!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again or use email login.";
      toast({
        title: "Social login failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoginMethod(null);
    }
  };

  return (
    <div className="space-y-6">
      {loginMethod !== 'form' && showSocialSection && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium mb-4">Log in with</h3>
          <div className="grid grid-cols-2 gap-3">
            {showGoogle && (
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                {isLoading && loginMethod === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            )}
            {showFacebook && (
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
              >
                {isLoading && loginMethod === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                Facebook
              </Button>
            )}
          </div>
          {showWhatsapp && (
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={() => handleSocialLogin('whatsapp')}
              disabled={isLoading}
            >
              {isLoading && loginMethod === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
              WhatsApp
            </Button>
          )}

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

      {loginMethod !== 'social' && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="text-right">
              <Button
                variant="link"
                type="button"
                className="px-0"
                onClick={async () => {
                  const email = form.getValues('email');
                  if (!email) {
                    toast({
                      title: "Email required",
                      description: "Please enter your email address first to reset your password.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    await resetPassword(email);
                    toast({
                      title: "Password reset email sent",
                      description: "Please check your inbox for instructions to reset your password.",
                    });
                  } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : "Failed to send reset email.";
                    toast({
                      title: "Error",
                      description: message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default LoginForm;
