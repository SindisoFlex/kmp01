
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Eye, User, MessageSquare, Award, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembershipTier } from "@/utils/loyaltyUtils";

// Sample client data
const mockClients = [
  {
    id: "client-1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+27 12 345 6789",
    whatsapp: "+27 12 345 6789",
    joinDate: "2023-10-15",
    lastActivity: "2024-05-01",
    membershipTier: "gold" as MembershipTier,
    bookingsCount: 8,
    bookingsValue: "R24,500",
    activeGalleries: 3,
    assignedStaff: "John Wilson",
    status: "active"
  },
  {
    id: "client-2",
    name: "David Smith",
    email: "david@example.com",
    phone: "+27 23 456 7890",
    whatsapp: "+27 23 456 7890",
    joinDate: "2024-01-22",
    lastActivity: "2024-04-28",
    membershipTier: "silver" as MembershipTier,
    bookingsCount: 4,
    bookingsValue: "R12,800",
    activeGalleries: 2,
    assignedStaff: "Emily Davis",
    status: "active"
  },
  {
    id: "client-3",
    name: "Amanda Brown",
    email: "amanda@example.com",
    phone: "+27 34 567 8901",
    whatsapp: "+27 34 567 8901",
    joinDate: "2024-02-10",
    lastActivity: "2024-03-15",
    membershipTier: "bronze" as MembershipTier,
    bookingsCount: 1,
    bookingsValue: "R4,200",
    activeGalleries: 1,
    assignedStaff: "Michael Chen",
    status: "inactive"
  },
  {
    id: "client-4",
    name: "Robert Williams",
    email: "robert@example.com",
    phone: "+27 45 678 9012",
    whatsapp: "+27 45 678 9012",
    joinDate: "2023-08-05",
    lastActivity: "2024-04-20",
    membershipTier: "vip" as MembershipTier,
    bookingsCount: 12,
    bookingsValue: "R48,600",
    activeGalleries: 5,
    assignedStaff: "Emily Davis",
    status: "active"
  },
];

const mockBookings = [
  {
    id: "booking-1",
    date: "2024-04-15",
    service: "Wedding Photography",
    location: "Cape Town Beach",
    amount: "R15,000",
    status: "completed",
  },
  {
    id: "booking-2",
    date: "2024-03-22",
    service: "Family Portrait",
    location: "Studio",
    amount: "R3,500",
    status: "completed",
  }
];

const mockGalleries = [
  {
    id: "gallery-1",
    title: "Wedding Day - Beach Ceremony",
    date: "2024-04-15",
    type: "Wedding",
    images: 145,
    videos: 2,
    viewed: 32,
    expirationDate: "2026-04-15",
    status: "active"
  }
];

const ClientManagement: React.FC = () => {
  const [clientList, setClientList] = useState(mockClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterTier, setFilterTier] = useState("all");
  const [currentClient, setCurrentClient] = useState<any>(null);
  const [isViewClientOpen, setIsViewClientOpen] = useState(false);
  const [isEditTierOpen, setIsEditTierOpen] = useState(false);
  const [isEditAssignmentOpen, setIsEditAssignmentOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier>("free");

  // Filter and sort clients
  const getFilteredAndSortedClients = () => {
    let filtered = clientList.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterTier !== "all") {
      filtered = filtered.filter(client => client.membershipTier === filterTier);
    }

    switch (sortBy) {
      case "recent":
        return [...filtered].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
      case "active":
        return [...filtered].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      case "bookings":
        return [...filtered].sort((a, b) => b.bookingsCount - a.bookingsCount);
      case "name":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  };

  const handleUpdateTier = () => {
    if (!currentClient) return;

    const updatedClients = clientList.map(client => {
      if (client.id === currentClient.id) {
        return {
          ...client,
          membershipTier: selectedTier
        };
      }
      return client;
    });

    setClientList(updatedClients);
    setIsEditTierOpen(false);

    toast({
      title: "Tier Updated",
      description: `${currentClient.name}'s membership level has been updated to ${selectedTier.toUpperCase()}.`,
    });
  };

  const getTierBadgeVariant = (tier: MembershipTier) => {
    switch (tier) {
      case "bronze": return "outline";
      case "silver": return "secondary";
      case "gold": return "default";
      case "vip": return "destructive";
      default: return "outline";
    }
  };

  const filteredClients = getFilteredAndSortedClients();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">Manage and monitor your client relationships</p>
        </div>

        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Message All Clients
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Client Directory</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Joined</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                  <SelectItem value="bookings">Most Bookings</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead className="hidden md:table-cell">Membership</TableHead>
                  <TableHead className="hidden lg:table-cell">Bookings</TableHead>
                  <TableHead className="hidden lg:table-cell">Staff</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={getTierBadgeVariant(client.membershipTier)}>
                        {client.membershipTier.charAt(0).toUpperCase() + client.membershipTier.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{client.bookingsCount}</TableCell>
                    <TableCell className="hidden lg:table-cell">{client.assignedStaff}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentClient(client);
                            setIsViewClientOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentClient(client);
                            setSelectedTier(client.membershipTier);
                            setIsEditTierOpen(true);
                          }}
                        >
                          <Award className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Client Dialog */}
      <Dialog open={isViewClientOpen} onOpenChange={setIsViewClientOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
          </DialogHeader>
          {currentClient && (
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{currentClient.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentClient.email}</p>
                  </div>
                  <Badge variant={getTierBadgeVariant(currentClient.membershipTier)}>
                    {currentClient.membershipTier.toUpperCase()} Member
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{currentClient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p>{currentClient.joinDate}</p>
                  </div>
                </div>
                <Tabs defaultValue="bookings" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="galleries">Galleries</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bookings" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockBookings.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell>{b.date}</TableCell>
                            <TableCell>{b.service}</TableCell>
                            <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="galleries" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockGalleries.map((g) => (
                          <TableRow key={g.id}>
                            <TableCell>{g.title}</TableCell>
                            <TableCell>{g.type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewClientOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Tier Dialog */}
      <Dialog open={isEditTierOpen} onOpenChange={setIsEditTierOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Membership Tier</DialogTitle>
            <DialogDescription>Change loyalty level for {currentClient?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Tier</Label>
            <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as MembershipTier)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTierOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTier}>Update Tier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;
