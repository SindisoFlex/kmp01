
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/ui/Hero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import GuestQuoteForm from "@/components/auth/GuestQuoteForm";
import MemberBenefits from "@/components/membership/MemberBenefits";
import AuthDialog from "@/components/auth/AuthDialog";

const Membership: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for occasional clients and first-time customers.",
      features: [
        "Personal account",
        "Online booking",
        "Access to your photo galleries",
        "Basic photo downloads",
        "30-day gallery access",
      ],
      buttonText: "Sign Up Free",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Premium",
      price: "R149",
      period: "per month",
      description: "Ideal for regular clients who value photography services.",
      features: [
        "All Basic features",
        "Priority booking slots",
        "10% discount on all services",
        "Extended editing options",
        "6-month gallery access",
        "Priority support",
        "Monthly special offers",
      ],
      buttonText: "Become Premium",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "VIP",
      price: "R349",
      period: "per month",
      description: "For our most devoted clients who demand the very best.",
      features: [
        "All Premium features",
        "VIP booking slots",
        "20% discount on all services",
        "Unlimited editing options",
        "Lifetime gallery access",
        "24/7 VIP support",
        "Annual free photoshoot",
        "Personal photography consultant",
      ],
      buttonText: "Go VIP",
      buttonVariant: "outline" as const,
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "What does the membership include?",
      answer: "Our membership includes priority booking, special discounts, extended gallery access, and various perks based on your membership tier. Each tier offers increasingly valuable benefits for our clients.",
    },
    {
      question: "How does the loyalty points system work?",
      answer: "You earn points with every booking and purchase. For every R5 spent, you earn 1 loyalty point. These points contribute to your membership tier and can unlock special rewards and benefits.",
    },
    {
      question: "Is there a free option available?",
      answer: "Yes, our Basic membership is completely free and gives you access to essential features like online booking, personal account management, and basic gallery access.",
    },
    {
      question: "How long can I access my photo galleries?",
      answer: "Gallery access depends on your membership tier: Basic (30 days), Premium (6 months), and VIP (lifetime access). You can also extend access for R100 per year if needed.",
    },
    {
      question: "Can I upgrade my membership later?",
      answer: "Yes, you can upgrade your membership at any time. The new benefits will be applied immediately to your account.",
    },
    {
      question: "What payment methods do you accept for memberships?",
      answer: "We accept credit cards, debit cards, EFT payments, and direct bank transfers for membership subscriptions.",
    },
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        title="Membership & Loyalty"
        description="Join our membership program for exclusive benefits, discounts, and personalized photography services."
        bgClass="bg-primary/5"
      />

      {/* Main Content */}
      <section className="section-padding">
        <div className="page-container">
          {isAuthenticated && user && user.role !== 'guest' ? (
            <MemberBenefits />
          ) : (
            <Tabs defaultValue="membership" className="max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="membership">Membership Plans</TabsTrigger>
                <TabsTrigger value="quote">Request a Quote</TabsTrigger>
              </TabsList>

              {/* Membership Plans Tab */}
              <TabsContent value="membership">
                <div className="text-center mb-8">
                  <h2 className="mb-4">Choose Your Plan</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Select the membership tier that best suits your needs and unlock exclusive benefits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.map((plan, index) => (
                    <Card
                      key={index}
                      className={`overflow-hidden ${
                        plan.popular
                          ? "border-primary shadow-lg relative"
                          : "border"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                          Most Popular
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground ml-1">
                            {plan.period}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {plan.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <AuthDialog 
                          triggerElement={
                            <Button
                              variant={plan.buttonVariant}
                              className="w-full"
                            >
                              {plan.buttonText}
                            </Button>
                          }
                          defaultTab="register"
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Quote Request Tab */}
              <TabsContent value="quote">
                <div className="max-w-xl mx-auto">
                  <GuestQuoteForm />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Features Section - show for everyone */}
      <section className="section-padding bg-muted/30">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Membership Benefits</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enjoy these exclusive benefits when you join our membership program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Loyalty Points",
                description: "Earn points with every purchase that contribute to your membership tier and unlock exclusive rewards.",
                icon: "⭐",
              },
              {
                title: "Priority Booking",
                description: "Get first access to our calendar and secure your preferred time slots before they're available to others.",
                icon: "📅",
              },
              {
                title: "Special Discounts",
                description: "Enjoy membership-exclusive discounts on all our photography services and products.",
                icon: "💰",
              },
              {
                title: "Extended Gallery Access",
                description: "Keep your precious memories accessible for longer periods depending on your membership tier.",
                icon: "🖼️",
              },
              {
                title: "Premium Support",
                description: "Get faster responses and personalized support for all your photography needs.",
                icon: "🤝",
              },
              {
                title: "Exclusive Events",
                description: "Be invited to member-only events, workshops, and special photography sessions.",
                icon: "✨",
              },
            ].map((benefit, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="text-3xl mb-4">{benefit.icon}</div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="section-padding">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our membership program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-xl font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary/10">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Ready to Join Our Membership?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start enjoying exclusive benefits today and take your photography experience to the next level.
            </p>
            <AuthDialog 
              triggerElement={
                <Button size="lg">
                  Sign Up Now
                </Button>
              }
              defaultTab="register"
            />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Membership;
