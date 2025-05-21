
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
import { Search, Eye, Edit, User, MessageSquare, Award, Calendar, Contact } from "lucide-react";
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
import { MembershipTier } from "@/utils/pointsUtils";

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
    points: 125,
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
    points: 75,
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
    points: 30,
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
    points: 315,
    bookingsCount: 12,
    bookingsValue: "R48,600",
    activeGalleries: 5,
    assignedStaff: "Emily Davis",
    status: "active"
  },
];

// Sample booking data
const mockBookings = [
  {
    id: "booking-1",
    date: "2024-04-15",
    service: "Wedding Photography",
    package: "Premium Package",
    location: "Cape Town Beach",
    amount: "R15,000",
    status: "completed",
    photographerId: "staff-1"
  },
  {
    id: "booking-2",
    date: "2024-03-22",
    service: "Family Portrait",
    package: "Standard Package",
    location: "Studio",
    amount: "R3,500",
    status: "completed",
    photographerId: "staff-1"
  },
  {
    id: "booking-3",
    date: "2024-05-30",
    service: "Commercial Shoot",
    package: "Corporate Package",
    location: "Client Office",
    amount: "R6,000",
    status: "upcoming",
    photographerId: "staff-2"
  }
];

// Sample gallery data
const mockGalleries = [
  {
    id: "gallery-1",
    title: "Wedding Day - Beach Ceremony",
    date: "2024-04-15",
    type: "Wedding",
    images: 145,
    videos: 2,
    viewed: 32,
    downloadEnabled: true,
    expirationDate: "2026-04-15",
    status: "active"
  },
  {
    id: "gallery-2",
    title: "Family Portrait Session",
    date: "2024-03-22",
    type: "Portrait",
    images: 65,
    videos: 0,
    viewed: 12,
    downloadEnabled: true,
    expirationDate: "2026-03-22",
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
  const [isEditPointsOpen, setIsEditPointsOpen] = useState(false);
  const [isEditAssignmentOpen, setIsEditAssignmentOpen] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [pointsReason, setPointsReason] = useState("");

  // Filter and sort clients
  const getFilteredAndSortedClients = () => {
    // First filter by search query
    let filtered = clientList.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Then filter by tier if not "all"
    if (filterTier !== "all") {
      filtered = filtered.filter(client => client.membershipTier === filterTier);
    }
    
    // Then sort based on the selected option
    switch (sortBy) {
      case "recent":
        return [...filtered].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
      case "active":
        return [...filtered].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      case "points":
        return [...filtered].sort((a, b) => b.points - a.points);
      case "bookings":
        return [...filtered].sort((a, b) => b.bookingsCount - a.bookingsCount);
      case "name":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  };
  
  // Handle points adjustment
  const handleAdjustPoints = () => {
    if (!currentClient) return;
    
    const updatedClients = clientList.map(client => {
      if (client.id === currentClient.id) {
        const newPoints = client.points + pointsToAdd;
        return {
          ...client,
          points: newPoints >= 0 ? newPoints : 0 // Prevent negative points
        };
      }
      return client;
    });
    
    setClientList(updatedClients);
    // Update current client view
    if (currentClient) {
      setCurrentClient({
        ...currentClient,
        points: currentClient.points + pointsToAdd
      });
    }
    
    setIsEditPointsOpen(false);
    setPointsToAdd(0);
    setPointsReason("");
    
    toast({
      title: `Points ${pointsToAdd >= 0 ? "added" : "deducted"}`,
      description: `${Math.abs(pointsToAdd)} points ${pointsToAdd >= 0 ? "added to" : "deducted from"} ${currentClient.name}'s account.`,
    });
  };

  const getClientBookings = (clientId: string) => {
    // In a real application, this would filter bookings by client ID
    return mockBookings;
  };
  
  const getClientGalleries = (clientId: string) => {
    // In a real application, this would filter galleries by client ID
    return mockGalleries;
  };

  // Get tier badge color
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
      
      <Card className="card-dashboard">
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
                  <SelectValue placeholder="Filter by tier" />
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
                  <SelectItem value="points">Most Points</SelectItem>
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
                  <TableHead className="hidden md:table-cell">Points</TableHead>
                  <TableHead className="hidden lg:table-cell">Bookings</TableHead>
                  <TableHead className="hidden lg:table-cell">Staff</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
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
                      <TableCell className="hidden md:table-cell">{client.points}</TableCell>
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
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setCurrentClient(client);
                              setIsEditPointsOpen(true);
                            }}
                          >
                            <Award className="h-4 w-4" />
                            <span className="sr-only">Adjust Points</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No clients found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
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
            <>
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
                      {currentClient.membershipTier.charAt(0).toUpperCase() + currentClient.membershipTier.slice(1)} Member
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{currentClient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p>{currentClient.whatsapp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p>{currentClient.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p>{currentClient.lastActivity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Points</p>
                      <p className="font-medium">{currentClient.points}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned Staff</p>
                      <p>{currentClient.assignedStaff}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="bookings" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="galleries">Galleries</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="bookings" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead className="hidden md:table-cell">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getClientBookings(currentClient.id).map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>
                              <div>
                                <p>{booking.service}</p>
                                <p className="text-xs text-muted-foreground">{booking.location}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{booking.amount}</TableCell>
                            <TableCell>
                              <Badge variant={booking.status === "completed" ? "outline" : "default"}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="galleries" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden md:table-cell">Type</TableHead>
                          <TableHead className="hidden md:table-cell">Media</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getClientGalleries(currentClient.id).map((gallery) => (
                          <TableRow key={gallery.id}>
                            <TableCell>
                              <div>
                                <p>{gallery.title}</p>
                                <p className="text-xs text-muted-foreground">Created: {gallery.date}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{gallery.type}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {gallery.images} photos, {gallery.videos} videos
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                Expires: {gallery.expirationDate}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <p className="text-sm text-muted-foreground">
                        No recent activity logged for this client.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsViewClientOpen(false)}>
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewClientOpen(false);
                setIsEditAssignmentOpen(true);
              }}
            >
              Reassign Staff
            </Button>
            <Button
              onClick={() => {
                setIsViewClientOpen(false);
                setIsEditPointsOpen(true);
              }}
            >
              Adjust Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Points Dialog */}
      <Dialog open={isEditPointsOpen} onOpenChange={setIsEditPointsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjust Membership Points</DialogTitle>
            <DialogDescription>
              Add or deduct points from {currentClient?.name}'s account. Current points: {currentClient?.points}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="points-amount">Points Adjustment</Label>
              <Input 
                id="points-amount"
                type="number"
                placeholder="Enter points (use negative for deduction)"
                value={pointsToAdd !== 0 ? pointsToAdd : ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setPointsToAdd(isNaN(value) ? 0 : value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Use positive numbers to add points, negative to deduct points.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points-reason">Reason (optional)</Label>
              <Input 
                id="points-reason"
                placeholder="e.g., Referral bonus, Special promotion"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPointsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustPoints} disabled={pointsToAdd === 0}>
              {pointsToAdd > 0 ? "Add Points" : pointsToAdd < 0 ? "Deduct Points" : "Adjust Points"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reassign Staff Dialog */}
      <Dialog open={isEditAssignmentOpen} onOpenChange={setIsEditAssignmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reassign Staff</DialogTitle>
            <DialogDescription>
              Change the staff member assigned to {currentClient?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff-assignment">Assigned Staff</Label>
              <Select defaultValue="staff-1">
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff-1">John Wilson</SelectItem>
                  <SelectItem value="staff-2">Emily Davis</SelectItem>
                  <SelectItem value="staff-3">Michael Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Staff Reassigned",
                description: `${currentClient?.name} has been reassigned to a new staff member.`,
              });
              setIsEditAssignmentOpen(false);
            }}>
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;
