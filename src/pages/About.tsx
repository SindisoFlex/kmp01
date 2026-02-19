
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/ui/Hero";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const About: React.FC = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        title="About Kasilam Media production"
        description="We're a team of designers, developers, and strategists passionate about creating exceptional digital experiences."
        bgClass="bg-secondary/50 dark:bg-secondary/10"
      />

      {/* Our Story */}
      <section className="section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Founded in 2015, Kasilam Media production began with a simple mission: to create digital experiences that people love.
                What started as a small team of passionate designers and developers has grown into a full-service creative agency.
              </p>
              <p className="text-lg text-muted-foreground">
                Over the years, we've had the privilege of working with clients across various industries,
                from startups to Fortune 500 companies. Through every project, our focus remains the same —
                delivering exceptional work that exceeds expectations and drives results.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Our Mission</h3>
                  <p>To create meaningful digital experiences that connect people with brands they love.</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                  <p>To be the leading creative partner for businesses seeking innovation and growth in the digital landscape.</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-xl font-bold mb-2">Our Values</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Excellence in everything we do</li>
                    <li>Creativity that solves real problems</li>
                    <li>Collaboration that builds strong partnerships</li>
                    <li>Integrity in our work and relationships</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-muted/30">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our diverse team brings together expertise across design, development, and strategy to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Morgan",
                role: "Creative Director",
                image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
              },
              {
                name: "Jordan Lee",
                role: "Lead Developer",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
              },
              {
                name: "Casey Kim",
                role: "UX Designer",
                image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
              },
              {
                name: "Taylor Singh",
                role: "Project Manager",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
              },
              {
                name: "Jamie Rivera",
                role: "Marketing Specialist",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
              },
              {
                name: "Riley Patel",
                role: "Content Strategist",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
              },
            ].map((member, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover object-center"
                />
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
