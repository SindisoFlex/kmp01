
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon: Icon }) => {
  return (
    <Card className="card-dashboard">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 card-padding-responsive">
        <CardTitle className="text-sm font-medium text-truncate">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="card-content-responsive">
        <div className="text-2xl font-bold text-safe">{value}</div>
        <p className="text-xs text-muted-foreground text-safe">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
