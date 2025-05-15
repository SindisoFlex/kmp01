
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/ui/Hero";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Membership: React.FC = () => {
  const plans = [
    {
      name: "Basic",
      price: "$49",
      period: "per month",
      description: "Perfect for small businesses and startups.",
      features: [
        "1 project per month",
        "Basic design customization",
        "48-hour response time",
        "Email support",
        "Monthly progress reports",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Professional",
      price: "$149",
      period: "per month",
      description: "Ideal for growing businesses and teams.",
      features: [
        "3 projects per month",
        "Advanced design customization",
        "24-hour response time",
        "Email and phone support",
        "Weekly progress reports",
        "Priority queue",
        "Dedicated account manager",
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$349",
      period: "per month",
      description: "For organizations with complex requirements.",
      features: [
        "Unlimited projects",
        "Full design customization",
        "12-hour response time",
        "24/7 priority support",
        "Real-time progress tracking",
        "VIP queue",
        "Dedicated team",
        "Strategic consulting",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "What does the membership include?",
      answer: "Our membership includes access to our design and development services based on your chosen plan. This includes website and app design, development work, revisions, and ongoing support according to your plan's specifications.",
    },
    {
      question: "Can I upgrade my plan later?",
      answer: "Yes, you can upgrade your plan at any time. The new pricing will be prorated for the remainder of your billing cycle. Simply contact our support team or use the account settings to upgrade.",
    },
    {
      question: "Is there a long-term commitment?",
      answer: "No, all our plans are month-to-month with no long-term commitment required. You can cancel at any time, effective at the end of your current billing cycle.",
    },
    {
      question: "How do I request a project?",
      answer: "Once you're a member, you can submit project requests through your client dashboard. Our team will review your request and begin working according to your plan's timeline and priority level.",
    },
    {
      question: "What if I need more projects than my plan allows?",
      answer: "If you need additional projects beyond your plan's allocation, you can purchase one-time project credits or temporarily upgrade to a higher tier plan.",
    },
    {
      question: "How does the revision process work?",
      answer: "Each project includes a specified number of revision rounds based on your membership plan. Additional revisions can be requested for an extra fee if needed.",
    },
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        title="Membership Plans"
        description="Join our membership program for ongoing design and development support at a predictable monthly rate."
        bgClass="bg-primary/5"
      />

      {/* Pricing Section */}
      <section className="section-padding">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the membership plan that best suits your business needs and scale up as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                  <Button
                    asChild
                    variant={plan.buttonVariant}
                    className="w-full"
                  >
                    <Link to="/contact">{plan.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
                title: "Predictable Pricing",
                description: "Know exactly what you'll pay each month with no surprises or hidden fees.",
                icon: "💰",
              },
              {
                title: "Priority Support",
                description: "Get faster responses and dedicated support for all your projects.",
                icon: "⭐",
              },
              {
                title: "Flexible Scaling",
                description: "Easily scale your services up or down as your business needs change.",
                icon: "📈",
              },
              {
                title: "Dedicated Team",
                description: "Work with the same team who understands your brand and vision.",
                icon: "👥",
              },
              {
                title: "Expedited Delivery",
                description: "Get your projects completed faster with our streamlined process.",
                icon: "⚡",
              },
              {
                title: "Strategic Partnership",
                description: "We become an extension of your team, aligned with your goals.",
                icon: "🤝",
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
            <h2 className="mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our membership program today and experience the benefits of having a dedicated design and development team.
            </p>
            <Button asChild size="lg">
              <Link to="/contact">Contact Us Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Membership;
