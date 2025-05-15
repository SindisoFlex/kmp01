
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeroProps {
  title: string;
  description: string;
  primaryCTA?: {
    text: string;
    link: string;
  };
  secondaryCTA?: {
    text: string;
    link: string;
  };
  bgClass?: string;
  alignment?: "left" | "center" | "right";
  imageUrl?: string;
  fullHeight?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  bgClass = "bg-secondary/30 dark:bg-secondary/10",
  alignment = "left",
  imageUrl,
  fullHeight = false,
}) => {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div className={`${bgClass} overflow-hidden ${fullHeight ? 'min-h-screen' : 'py-20 lg:py-32'}`}>
      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className={`flex flex-col ${alignmentClasses[alignment]} space-y-6`}>
            <h1 className="font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl">
              {description}
            </p>
            {(primaryCTA || secondaryCTA) && (
              <div className={`flex flex-wrap gap-4 mt-6 ${
                alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"
              }`}>
                {primaryCTA && (
                  <Button asChild size="lg">
                    <Link to={primaryCTA.link}>{primaryCTA.text}</Link>
                  </Button>
                )}
                {secondaryCTA && (
                  <Button asChild variant="outline" size="lg">
                    <Link to={secondaryCTA.link}>{secondaryCTA.text}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
          {imageUrl && (
            <div className="order-first lg:order-last">
              <img
                src={imageUrl}
                alt="Hero image"
                className="w-full h-auto object-cover rounded-lg shadow-lg transform lg:translate-x-10 lg:scale-110"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
