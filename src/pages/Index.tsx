
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/ui/Hero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const Index: React.FC = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        title="Creative Design Solutions for Modern Businesses"
        description="We create exceptional digital experiences that captivate your audience and drive business growth."
        primaryCTA={{ text: "Our Services", link: "/services" }}
        secondaryCTA={{ text: "Get in Touch", link: "/contact" }}
        fullHeight
      />

      {/* Features Section */}
      <section className="section-padding bg-background">
        <div className="page-container">
          <div className="max-w-xl mx-auto text-center mb-12">
            <h2 className="mb-4">What We Do</h2>
            <p className="text-lg text-muted-foreground">
              We combine strategy, design, and technology to create exceptional digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Web Design",
                description: "Beautiful, functional websites that engage your audience.",
                icon: "🎨",
              },
              {
                title: "App Development",
                description: "Native and cross-platform mobile applications.",
                icon: "📱",
              },
              {
                title: "Brand Identity",
                description: "Cohesive branding that tells your unique story.",
                icon: "✨",
              },
              {
                title: "UI/UX Design",
                description: "Intuitive interfaces focused on user experience.",
                icon: "🔍",
              },
              {
                title: "Digital Marketing",
                description: "Strategic campaigns that drive measurable results.",
                icon: "📈",
              },
              {
                title: "Content Creation",
                description: "Engaging content that resonates with your audience.",
                icon: "📝",
              },
            ].map((feature, index) => (
              <Card key={index} className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                  <Button variant="link" className="p-0 mt-4" asChild>
                    <Link to="/services" className="flex items-center">
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 section-padding">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Ready to Start Your Project?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let's work together to bring your vision to life with innovative design and development solutions.
            </p>
            <Button asChild size="lg">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
