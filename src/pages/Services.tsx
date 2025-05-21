
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/ui/Hero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Video, Brain, Globe, MessageCircle, Printer } from "lucide-react";

const Services: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("photography");

  const services = {
    photography: {
      title: "Photography",
      icon: <Camera className="w-10 h-10 text-primary" />,
      description: "Professional photography services for all your needs",
      categories: [
        {
          title: "Wedding Photography",
          description: "Capture your special day with our professional wedding photography services.",
          features: ["Full day coverage", "Professional editing", "Online gallery", "Print options"]
        },
        {
          title: "Funeral Photography",
          description: "Respectfully document memorial services and celebrations of life.",
          features: ["Discreet coverage", "Tasteful editing", "Memorial albums", "Family-focused"]
        },
        {
          title: "Portrait Photography",
          description: "Professional portraits for individuals, families, and corporate needs.",
          features: ["Studio or location", "Multiple outfit changes", "Retouching included", "Digital delivery"]
        },
        {
          title: "Commercial Photography",
          description: "High-quality images for your business, products, and marketing needs.",
          features: ["Product photography", "Corporate headshots", "Brand imagery", "Commercial license"]
        },
        {
          title: "Event Photography",
          description: "Document your corporate events, parties, and special occasions.",
          features: ["Full event coverage", "Quick turnaround", "Online gallery", "Print options"]
        }
      ]
    },
    videography: {
      title: "Videography",
      icon: <Video className="w-10 h-10 text-primary" />,
      description: "Professional video production services",
      categories: [
        {
          title: "Wedding Videography",
          description: "Cinematic wedding films that capture the emotion and beauty of your day.",
          features: ["Full day coverage", "Highlight films", "Documentary edits", "Drone footage"]
        },
        {
          title: "Funeral Services",
          description: "Respectful documentation of memorial services for those unable to attend.",
          features: ["Discreet filming", "Live streaming", "Full service recording", "Memorial videos"]
        },
        {
          title: "Short Films & Documentaries",
          description: "Professional short films and documentary production for personal or business needs.",
          features: ["Concept development", "Professional shooting", "Complete editing", "Music licensing"]
        },
        {
          title: "Commercial Videography",
          description: "Promotional videos, product demonstrations, and corporate messaging.",
          features: ["Brand alignment", "Professional scripts", "Motion graphics", "Distribution formats"]
        },
        {
          title: "Live Streaming Services",
          description: "Professional multi-camera live streaming for events and presentations.",
          features: ["Multi-platform streaming", "Professional equipment", "Technical support", "Recording backup"]
        }
      ]
    },
    aiTraining: {
      title: "AI Training",
      icon: <Brain className="w-10 h-10 text-primary" />,
      description: "Empower your team with AI skills",
      categories: [
        {
          title: "AI Basics Bootcamp",
          description: "Introduction to AI concepts and practical applications for beginners.",
          features: ["Fundamental concepts", "Hands-on exercises", "Real-world applications", "Certificate of completion"]
        },
        {
          title: "AI for Business Integration",
          description: "Learn how to integrate AI tools into your existing business workflows.",
          features: ["Business process analysis", "Tool selection guidance", "Implementation strategies", "ROI measurement"]
        },
        {
          title: "Build Your AI Agent (Advanced)",
          description: "Advanced training for teams wanting to build custom AI solutions.",
          features: ["Custom prompt engineering", "API integration", "Agent architecture", "Deployment strategies"]
        },
        {
          title: "On-site or Remote Delivery",
          description: "Flexible training delivery options to suit your team's needs.",
          features: ["In-person workshops", "Live virtual sessions", "Hybrid options", "Recorded sessions"]
        }
      ]
    },
    webDevelopment: {
      title: "Web & App Development",
      icon: <Globe className="w-10 h-10 text-primary" />,
      description: "Custom digital solutions for your business",
      categories: [
        {
          title: "Full-stack Website Design",
          description: "Complete website solutions from design to deployment and hosting.",
          features: ["Custom design", "Responsive development", "CMS integration", "SEO optimization"]
        },
        {
          title: "Mobile App Interface Design",
          description: "User-friendly mobile application interfaces for iOS and Android.",
          features: ["UI/UX design", "Prototype development", "User testing", "Implementation support"]
        },
        {
          title: "Client Login System",
          description: "Secure client portal systems for your business.",
          features: ["Secure authentication", "User management", "Permission controls", "Data protection"]
        },
        {
          title: "Membership Dashboards",
          description: "Custom dashboards for membership-based businesses.",
          features: ["User profiles", "Payment integration", "Analytics tracking", "Content management"]
        }
      ]
    },
    digitalMarketing: {
      title: "Digital Marketing",
      icon: <MessageCircle className="w-10 h-10 text-primary" />,
      description: "Boost your online presence and reach",
      categories: [
        {
          title: "Social Media Ads",
          description: "Targeted advertising campaigns across major social media platforms.",
          features: ["Audience targeting", "Ad creation", "Performance tracking", "A/B testing"]
        },
        {
          title: "Campaign Strategy",
          description: "Comprehensive marketing strategies aligned with your business goals.",
          features: ["Market analysis", "Goal setting", "Channel selection", "Budget optimization"]
        },
        {
          title: "Content Creation",
          description: "Engaging content designed to convert and retain customers.",
          features: ["Copywriting", "Graphic design", "Video production", "Content calendar"]
        },
        {
          title: "Brand Awareness Programs",
          description: "Strategic initiatives to increase your brand's visibility and recognition.",
          features: ["Brand positioning", "Audience engagement", "Cross-channel promotion", "Measurement metrics"]
        }
      ]
    },
    printing: {
      title: "Printing Services",
      icon: <Printer className="w-10 h-10 text-primary" />,
      description: "High-quality printing for all your needs",
      categories: [
        {
          title: "Business Cards, Flyers & Banners",
          description: "Professional printing for your marketing materials.",
          features: ["Premium paper options", "Custom sizes", "Fast turnaround", "Bulk discounts"]
        },
        {
          title: "Event Printing",
          description: "Complete printing solutions for events and programs.",
          features: ["Event programs", "Signage", "Name badges", "Thank you cards"]
        },
        {
          title: "Custom Promotional Products",
          description: "Branded merchandise for business promotion and events.",
          features: ["T-shirts", "Mugs", "Promotional items", "Custom packaging"]
        }
      ]
    }
  };

  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        title="Our Services"
        description="Comprehensive creative solutions tailored to your specific needs"
        bgClass="bg-primary/10"
      />

      {/* Services Categories */}
      <section className="section-padding">
        <div className="page-container">
          <div className="mb-12">
            <h2 className="mb-4">What We Offer</h2>
            <p className="text-lg text-muted-foreground max-w-3xl">
              From capturing memories to building your digital presence, we provide end-to-end creative services to help you showcase your story.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {Object.entries(services).map(([key, service]) => (
              <Card 
                key={key} 
                className={`border border-border hover:shadow-md transition-shadow cursor-pointer ${selectedCategory === key ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedCategory(key)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    {service.icon}
                  </div>
                  <div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription className="mt-1.5">{service.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Selected Service Details */}
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                {services[selectedCategory].icon}
                <span>{services[selectedCategory].title} Services</span>
              </CardTitle>
              <CardDescription className="text-lg">
                {services[selectedCategory].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services[selectedCategory].categories.map((category, index) => (
                  <Card key={index} className="border border-border bg-accent/5">
                    <CardHeader>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        {category.features.map((feature, i) => (
                          <li key={i} className="text-sm">{feature}</li>
                        ))}
                      </ul>
                      <div className="flex justify-between items-center mt-4">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedService(category.title);
                            setIsQuoteDialogOpen(true);
                          }}
                        >
                          Request Quote
                        </Button>
                        <Link to="/contact" className="text-sm text-primary hover:underline">
                          More Info
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
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

      {/* Quote Request Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Quote</DialogTitle>
            <DialogDescription>
              {selectedService ? `Get a customized quote for ${selectedService}` : "Get a customized quote for our services"}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="mb-4">
              To receive a personalized quote for this service, please visit our contact page or call us directly.
            </p>
            <Button asChild className="mr-2" onClick={() => setIsQuoteDialogOpen(false)}>
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Services;
