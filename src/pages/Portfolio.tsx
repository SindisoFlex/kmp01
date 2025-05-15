
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/ui/Hero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const portfolioItems = [
  {
    id: 1,
    title: "Eco-Friendly E-commerce Platform",
    category: "Web Development",
    tags: ["E-commerce", "React", "Node.js"],
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    description: "A fully responsive e-commerce platform for a sustainable products brand, featuring custom product filtering, user accounts, and an intuitive checkout process.",
    challenge: "Creating a seamless shopping experience while showcasing the brand's commitment to sustainability.",
    solution: "We developed a custom React-based frontend with optimized images and animations, integrated with a headless CMS for easy content management.",
    results: "50% increase in conversion rate and 30% reduction in bounce rate within the first three months after launch.",
  },
  {
    id: 2,
    title: "Health & Wellness Mobile App",
    category: "App Development",
    tags: ["Mobile App", "React Native", "Health"],
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    description: "A cross-platform mobile app for tracking fitness goals, nutrition, and mental wellness with personalized recommendations.",
    challenge: "Building an app that seamlessly integrates multiple health metrics while maintaining an intuitive user experience.",
    solution: "We created a React Native app with custom animations, integrated with health APIs, and implemented machine learning for personalized recommendations.",
    results: "Over 100,000 downloads in the first month with a 4.8-star rating across app stores.",
  },
  {
    id: 3,
    title: "Financial Services Rebrand",
    category: "Brand Identity",
    tags: ["Branding", "UI Design", "Financial"],
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    description: "A complete rebrand for a financial services firm, including new visual identity, website, and marketing materials.",
    challenge: "Modernizing the brand while maintaining trust and professionalism essential for financial services.",
    solution: "We developed a sophisticated yet approachable visual identity with a color palette conveying trust and innovation, complemented by custom illustrations.",
    results: "25% increase in client inquiries and significant improvement in brand recognition metrics.",
  },
  {
    id: 4,
    title: "Smart Home Dashboard",
    category: "UI/UX Design",
    tags: ["UI/UX", "IoT", "Dashboard"],
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    description: "An intuitive dashboard for managing smart home devices with real-time monitoring and automation capabilities.",
    challenge: "Simplifying complex IoT controls into a user-friendly interface accessible to users of all technical abilities.",
    solution: "We designed an intuitive UI with customizable widgets, clear data visualization, and simple automation workflows.",
    results: "Reduced user support tickets by 40% and increased daily active users by 65% compared to previous version.",
  },
  {
    id: 5,
    title: "Restaurant Online Ordering System",
    category: "Web Development",
    tags: ["Web App", "Food & Beverage", "E-commerce"],
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    description: "A custom online ordering system for a restaurant chain, featuring real-time order tracking and integration with point-of-sale systems.",
    challenge: "Creating a seamless ordering experience while handling complex menu options and integrating with existing systems.",
    solution: "We built a React-based progressive web app with offline capabilities and real-time order updates.",
    results: "35% increase in online orders and 28% higher average order value compared to third-party delivery platforms.",
  },
  {
    id: 6,
    title: "Educational Platform Redesign",
    category: "UI/UX Design",
    tags: ["Education", "Web App", "Accessibility"],
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    description: "A comprehensive redesign of an online learning platform to improve user engagement and accessibility.",
    challenge: "Enhancing the learning experience while ensuring accessibility for users with different abilities and technical constraints.",
    solution: "We redesigned the interface with a focus on accessibility, implemented improved navigation, and created an adaptive learning path system.",
    results: "Course completion rates increased by 45% and user satisfaction scores improved from 3.2 to 4.7 out of 5.",
  },
];

const Portfolio: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredItems = categoryFilter
    ? portfolioItems.filter((item) => item.category === categoryFilter)
    : portfolioItems;

  const categories = Array.from(new Set(portfolioItems.map((item) => item.category)));

  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        title="Our Portfolio"
        description="Explore our recent projects and discover how we've helped our clients achieve their goals."
        bgClass="bg-accent/50"
      />

      {/* Portfolio Filters */}
      <section className="py-8 border-b">
        <div className="page-container">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={categoryFilter === null ? "default" : "outline"}
              className="cursor-pointer text-sm py-1 px-3"
              onClick={() => setCategoryFilter(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                className="cursor-pointer text-sm py-1 px-3"
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-0 shadow-md cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative h-64">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        {item.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedItem.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2 mt-2">
                {selectedItem.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Project Overview</h3>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">The Challenge</h3>
                  <p className="text-muted-foreground">{selectedItem.challenge}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Our Solution</h3>
                  <p className="text-muted-foreground">{selectedItem.solution}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Results</h3>
                  <p className="text-muted-foreground">{selectedItem.results}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </PageLayout>
  );
};

export default Portfolio;
