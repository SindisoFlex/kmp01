
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/ui/Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Services: React.FC = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        title="Our Services"
        description="We offer a comprehensive range of creative services tailored to your business needs."
        bgClass="bg-primary/10"
      />

      {/* Services Overview */}
      <section className="section-padding">
        <div className="page-container">
          <div className="mb-12">
            <h2 className="mb-4">What We Offer</h2>
            <p className="text-lg text-muted-foreground max-w-3xl">
              From concept to completion, we provide end-to-end services to help your business thrive in the digital landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Web Design & Development",
                description: "Custom websites that are visually stunning, responsive, and optimized for performance.",
                icon: "🖥️",
              },
              {
                title: "Mobile App Development",
                description: "Native and cross-platform mobile apps that deliver exceptional user experiences.",
                icon: "📱",
              },
              {
                title: "Brand Identity",
                description: "Comprehensive branding solutions that establish your unique market position.",
                icon: "🎭",
              },
              {
                title: "UI/UX Design",
                description: "User-centered design that enhances satisfaction and drives engagement.",
                icon: "🎨",
              },
              {
                title: "Digital Marketing",
                description: "Strategic campaigns across multiple channels to increase visibility and conversions.",
                icon: "📊",
              },
              {
                title: "Content Creation",
                description: "Compelling content that tells your story and resonates with your audience.",
                icon: "✍️",
              },
            ].map((service, index) => (
              <Card key={index} className="border border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-muted/30">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We follow a structured approach to ensure every project is delivered successfully.
            </p>
          </div>

          <Tabs defaultValue="discovery" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="discovery">Discovery</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="discovery" className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">1. Discovery Phase</h3>
              <p className="mb-4">
                We start by understanding your business, goals, target audience, and project requirements.
                This phase involves extensive research, competitor analysis, and stakeholder interviews.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Initial consultation and requirement gathering</li>
                <li>Market and competitor research</li>
                <li>User persona development</li>
                <li>Project scope definition</li>
              </ul>
            </TabsContent>
            <TabsContent value="design" className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">2. Design Phase</h3>
              <p className="mb-4">
                Our design team creates wireframes, mockups, and prototypes to visualize the final product.
                We collaborate closely with you to refine the design until it perfectly matches your vision.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Information architecture</li>
                <li>Wireframing and prototyping</li>
                <li>Visual design and branding</li>
                <li>User testing and feedback</li>
              </ul>
            </TabsContent>
            <TabsContent value="development" className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">3. Development Phase</h3>
              <p className="mb-4">
                Our development team brings the designs to life using the latest technologies and best practices.
                We ensure that the final product is robust, scalable, and performs excellently.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Frontend and backend development</li>
                <li>Content integration</li>
                <li>Quality assurance testing</li>
                <li>Performance optimization</li>
              </ul>
            </TabsContent>
            <TabsContent value="delivery" className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">4. Delivery Phase</h3>
              <p className="mb-4">
                We launch your project, provide thorough documentation, and offer training if required.
                Our relationship doesn't end at launch – we provide ongoing support and maintenance.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Project deployment</li>
                <li>Client training and documentation</li>
                <li>Post-launch support</li>
                <li>Analytics setup and monitoring</li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary/5">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Ready to Start Your Project?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact us today to discuss your requirements and how we can help bring your vision to life.
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

export default Services;
