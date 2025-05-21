
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: number; // Positive number for upward trend, negative for downward
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon: Icon, trend }) => {
  const showTrend = trend !== undefined;
  const isPositive = trend && trend > 0;
  
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 card-padding-responsive">
        <CardTitle className="text-sm font-medium text-truncate">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="card-content-responsive pt-2">
        <div className="text-2xl font-bold text-safe overflow-hidden text-ellipsis">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground text-safe overflow-hidden text-ellipsis">{description}</p>
          
          {showTrend && (
            <div className={`flex items-center text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
