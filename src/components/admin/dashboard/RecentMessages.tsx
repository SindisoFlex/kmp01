
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface RecentMessagesProps {
  unreadCount: number;
}

const RecentMessages: React.FC<RecentMessagesProps> = ({ unreadCount }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>
            Unread client communications
          </CardDescription>
        </div>
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary">
          <span className="text-xs font-medium text-white">
            {unreadCount}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-2 border-b pb-4 last:border-0 last:pb-0">
              <div className="min-w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                {String.fromCharCode(64 + i)}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {i === 1 ? "Alice Johnson" : 
                   i === 2 ? "Bob Smith" : "Carol Williams"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {i === 1 ? "I'd like to discuss my wedding photoshoot plans with you. Can we schedule a call?" : 
                   i === 2 ? "When will my family portrait gallery be ready? I'm excited to see the photos!" : 
                   "Thanks for the quick response. I'll check the contract and get back to you tomorrow."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {i === 1 ? "5m ago" : 
                   i === 2 ? "1h ago" : "2h ago"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" size="sm">
          View all messages <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentMessages;
