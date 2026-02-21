
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/use-toast";

const quoteSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().optional(),
  serviceType: z.enum(["portrait", "wedding", "commercial", "event"]),
  details: z.string().min(10, { message: "Please provide more details about your request" }),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const GuestQuoteForm: React.FC = () => {
  const { guestAccess } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceType: "portrait",
      details: "",
    },
  });

  const onSubmit = async (values: QuoteFormValues) => {
    setIsLoading(true);
    try {
      // Register as guest user
      await guestAccess(values.name, values.email);

      // Simulate API call for quote submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Quote request submitted!",
        description: "We'll get back to you within 24 hours with a personalized quote.",
      });

      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Failed to submit quote",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Request a Quote</h2>
        <p className="text-muted-foreground">
          Fill out the form below and we'll get back to you with a personalized quote.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
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
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+27 12 345 6789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Service Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <RadioGroupItem value="portrait" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Portrait</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <RadioGroupItem value="wedding" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Wedding</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <RadioGroupItem value="commercial" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Commercial</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <RadioGroupItem value="event" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Event</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe your project, expected date, location, and any special requirements..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Request Quote"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default GuestQuoteForm;
