
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PieChart,
  BarChart2,
  Award,
  Users,
  Gift,
  Search,
  Plus,
  Minus,
  MoreHorizontal,
  Share2,
  ArrowUpRight,
  Filter,
  Settings,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Sample data for the loyalty program
const mockTierData = {
  tiers: [
    { 
      name: "Bronze", 
      threshold: 0, 
      benefits: [
        "5% discount on services",
        "Early access to seasonal specials",
        "Birthday gift voucher"
      ],
      color: "#CD7F32"
    },
    { 
      name: "Silver", 
      threshold: 2000, 
      benefits: [
        "10% discount on services",
        "Free delivery on printed materials",
        "Exclusive event invitations",
        "Priority booking"
      ],
      color: "#C0C0C0"
    },
    { 
      name: "Gold", 
      threshold: 5000, 
      benefits: [
        "15% discount on services",
        "Free annual photoshoot",
        "24/7 priority support",
        "Free prints with every session",
        "Access to VIP events"
      ],
      color: "#FFD700"
    }
  ],
  clients: [
    { id: 1, name: "Sarah Johnson", points: 3500, tier: "Silver", referrals: 3 },
    { id: 2, name: "Michael Brown", points: 7200, tier: "Gold", referrals: 5 },
    { id: 3, name: "Emma Williams", points: 1200, tier: "Bronze", referrals: 1 },
    { id: 4, name: "James Smith", points: 4800, tier: "Silver", referrals: 2 },
    { id: 5, name: "Olivia Davis", points: 6500, tier: "Gold", referrals: 4 },
    { id: 6, name: "William Jones", points: 900, tier: "Bronze", referrals: 0 },
    { id: 7, name: "Sophia Miller", points: 2100, tier: "Silver", referrals: 1 },
    { id: 8, name: "Benjamin Wilson", points: 8300, tier: "Gold", referrals: 7 }
  ],
  referrals: [
    { id: 1, referrer: "Michael Brown", referee: "Emma Williams", date: "2023-03-15", status: "completed", points: 500 },
    { id: 2, referrer: "Olivia Davis", referee: "William Jones", date: "2023-04-22", status: "completed", points: 500 },
    { id: 3, referrer: "Benjamin Wilson", referee: "James Smith", date: "2023-05-10", status: "completed", points: 500 },
    { id: 4, referrer: "Sarah Johnson", referee: "Michael Parker", date: "2023-06-05", status: "pending", points: 0 },
    { id: 5, referrer: "Benjamin Wilson", referee: "Lisa Thompson", date: "2023-06-18", status: "pending", points: 0 },
  ]
};

const getClientCountByTier = () => {
  const counts = { Bronze: 0, Silver: 0, Gold: 0 };
  mockTierData.clients.forEach(client => {
    counts[client.tier as keyof typeof counts]++;
  });
  return counts;
};

const getTotalPointsByTier = () => {
  const totals = { Bronze: 0, Silver: 0, Gold: 0 };
  mockTierData.clients.forEach(client => {
    totals[client.tier as keyof typeof totals] += client.points;
  });
  return totals;
};

const getTierColor = (tier: string) => {
  const tierData = mockTierData.tiers.find(t => t.name === tier);
  return tierData ? tierData.color : "#999";
};

const getTierBadgeClass = (tier: string) => {
  switch (tier) {
    case "Bronze":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    case "Silver":
      return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
    case "Gold":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "";
  }
};

const AdminLoyalty = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pointsAction, setPointsAction] = useState<"add" | "deduct">("add");
  const [selectedClient, setSelectedClient] = useState<(typeof mockTierData.clients)[0] | null>(null);
  const [pointsAmount, setPointsAmount] = useState(100);
  const [pointsReason, setPointsReason] = useState("");
  
  // Filter clients based on search and tier filter
  const filteredClients = mockTierData.clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === "all" || client.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleAdjustPoints = () => {
    if (!selectedClient || pointsAmount <= 0) return;
    
    // In a real app, this would update the database
    const finalAmount = pointsAction === "add" ? pointsAmount : -pointsAmount;
    
    // Show success message
    toast({
      title: `Points ${pointsAction === "add" ? "added" : "deducted"} successfully`,
      description: `${finalAmount} points ${pointsAction === "add" ? "added to" : "deducted from"} ${selectedClient.name}'s account${pointsReason ? ` for ${pointsReason}` : ''}.`
    });
    
    setDialogOpen(false);
    setPointsAmount(100);
    setPointsReason("");
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loyalty Program</h1>
          <p className="text-sm text-muted-foreground">
            Manage client tiers, points, and rewards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Program Settings
          </Button>
          <Button size="sm">
            <Gift className="h-4 w-4 mr-2" />
            Create Reward
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <BarChart2 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="tiers">
            <Award className="h-4 w-4 mr-2" />
            Tiers
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Share2 className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTierData.clients.length}</div>
                <p className="text-xs text-muted-foreground">Active loyalty program members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockTierData.clients.reduce((sum, client) => sum + client.points, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Points across all members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockTierData.clients.reduce((sum, client) => sum + client.referrals, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Successful client referrals</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Member Distribution</CardTitle>
                <CardDescription>Members by loyalty tier</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center">
                  <PieChart className="h-full w-full text-muted-foreground opacity-50" />
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <div className="w-full grid grid-cols-3 gap-2">
                  {Object.entries(getClientCountByTier()).map(([tier, count]) => (
                    <div key={tier} className="text-center p-2 rounded-lg bg-muted/30">
                      <Badge className={getTierBadgeClass(tier)} variant="outline">
                        {tier}
                      </Badge>
                      <p className="text-2xl font-bold mt-2">{count}</p>
                      <p className="text-xs text-muted-foreground">members</p>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest point transactions and tier changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { client: "Michael Brown", action: "Reached Gold tier", points: "+1,000 pts", date: "2 days ago" },
                    { client: "Emma Williams", action: "Birthday reward", points: "+250 pts", date: "3 days ago" },
                    { client: "Sophia Miller", action: "New booking", points: "+500 pts", date: "1 week ago" },
                    { client: "Benjamin Wilson", action: "Successful referral", points: "+500 pts", date: "1 week ago" },
                    { client: "James Smith", action: "Reviewed service", points: "+100 pts", date: "2 weeks ago" }
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm">{activity.client}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {activity.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <a href="#" className="flex items-center justify-center">
                    View all activity <ArrowUpRight className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Members</CardTitle>
              <CardDescription>View and manage members in the loyalty program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <Badge className={getTierBadgeClass(client.tier)} variant="outline">
                          {client.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{client.points.toLocaleString()}</TableCell>
                      <TableCell>{client.referrals}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog open={dialogOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
                            if (!open) setDialogOpen(false);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setDialogOpen(true);
                                }}
                              >
                                Adjust Points
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adjust Points for {selectedClient?.name}</DialogTitle>
                                <DialogDescription>
                                  Add or deduct points from this member's loyalty account.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex space-x-4">
                                  <div className="space-y-2 flex-1">
                                    <Label>Action</Label>
                                    <Select 
                                      value={pointsAction} 
                                      onValueChange={(value) => setPointsAction(value as "add" | "deduct")}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="add">Add Points</SelectItem>
                                        <SelectItem value="deduct">Deduct Points</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2 flex-1">
                                    <Label>Points</Label>
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      value={pointsAmount} 
                                      onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Reason (Optional)</Label>
                                  <Input 
                                    placeholder="e.g., Birthday reward, Service refund..." 
                                    value={pointsReason}
                                    onChange={(e) => setPointsReason(e.target.value)}
                                  />
                                </div>
                                <div className="rounded-md bg-muted p-3">
                                  <div className="text-sm">
                                    <span className="font-semibold">Current Balance:</span> {selectedClient?.points.toLocaleString()} points
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-semibold">New Balance:</span> {(selectedClient?.points || 0) + (pointsAction === "add" ? pointsAmount : -pointsAmount)} points
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAdjustPoints}>
                                  {pointsAction === "add" ? 
                                    <Plus className="h-4 w-4 mr-2" /> : 
                                    <Minus className="h-4 w-4 mr-2" />
                                  }
                                  {pointsAction === "add" ? "Add" : "Deduct"} Points
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Change Tier</DropdownMenuItem>
                              <DropdownMenuItem>View History</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Remove From Program</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No matching members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tiers" className="space-y-6">
          {mockTierData.tiers.map((tier, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5" style={{ color: tier.color }} />
                      {tier.name} Tier
                    </CardTitle>
                    <CardDescription>
                      {tier.threshold.toLocaleString()} points minimum
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Edit Tier</Button>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium text-sm mb-2">Benefits:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm">{benefit}</li>
                  ))}
                </ul>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">Members in this tier:</h4>
                    <Badge>
                      {mockTierData.clients.filter(c => c.tier === tier.name).length} members
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Total points in tier:</h4>
                    <span className="font-mono text-sm">
                      {mockTierData.clients
                        .filter(c => c.tier === tier.name)
                        .reduce((sum, c) => sum + c.points, 0)
                        .toLocaleString()} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Create New Tier</CardTitle>
              <CardDescription>
                Add a new loyalty tier with custom benefits and threshold
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Tier
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Track and manage client referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Referrals</h3>
                  <p className="text-2xl font-bold">{mockTierData.referrals.length}</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                  <p className="text-2xl font-bold">
                    {mockTierData.referrals.filter(r => r.status === "completed").length}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Points Awarded</h3>
                  <p className="text-2xl font-bold">
                    {mockTierData.referrals.reduce((sum, r) => sum + r.points, 0).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTierData.referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">{referral.referrer}</TableCell>
                      <TableCell>{referral.referee}</TableCell>
                      <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={referral.status === "completed" ? "default" : "outline"}
                          className={referral.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"}
                        >
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{referral.points}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={referral.status === "completed"}
                        >
                          {referral.status === "completed" ? "Approved" : "Approve"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                Export Referral Data
              </Button>
              <Button>
                Modify Referral Program
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLoyalty;

// Missing types import
import { MessageCircle } from "lucide-react";
