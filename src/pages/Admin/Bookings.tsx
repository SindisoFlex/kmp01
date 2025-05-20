
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Plus, Search, Users, FileText, X, Check } from "lucide-react";

// Mock data for demonstration
const mockBookings = [
  {
    id: "B001",
    clientName: "John & Sarah Smith",
    clientEmail: "john.smith@example.com",
    clientPhone: "+27 71 234 5678",
    service: "Wedding Photography",
    category: "Photography",
    subcategory: "Wedding",
    date: "2025-07-15T14:00:00",
    location: "Cape Town Gardens",
    status: "upcoming",
    staff: "Emily Davis",
    price: 5900,
    notes: "Outdoor ceremony, approximately 80 guests",
    createdAt: "2025-01-10T10:30:00",
    galleryStatus: "not_started"
  },
  {
    id: "B002",
    clientName: "ABC Corp",
    clientEmail: "marketing@abccorp.com",
    clientPhone: "+27 82 345 6789",
    service: "Commercial Photography",
    category: "Photography",
    subcategory: "Commercial",
    date: "2025-06-20T09:00:00",
    location: "Client Office",
    status: "upcoming",
    staff: "Michael Chen",
    price: 3500,
    notes: "Product photography for new catalog",
    createdAt: "2025-01-15T14:20:00",
    galleryStatus: "not_started"
  },
  {
    id: "B003",
    clientName: "Thompson Family",
    clientEmail: "thompson@example.com",
    clientPhone: "+27 83 456 7890",
    service: "Family Portrait Session",
    category: "Photography",
    subcategory: "Portrait",
    date: "2025-06-01T10:00:00",
    location: "Studio",
    status: "pending",
    staff: null,
    price: 1200,
    notes: "Family of 5, including 3 children under 10",
    createdAt: "2025-01-20T09:15:00",
    galleryStatus: "not_started"
  },
  {
    id: "B004",
    clientName: "TechStart Conference",
    clientEmail: "events@techstart.co.za",
    clientPhone: "+27 84 567 8901",
    service: "Event Photography & Live Streaming",
    category: "Videography",
    subcategory: "Live Streaming Services",
    date: "2025-05-10T08:00:00",
    location: "Convention Center",
    status: "ongoing",
    staff: "John Wilson",
    price: 8500,
    notes: "Full day event coverage plus same-day highlights",
    createdAt: "2025-01-05T11:45:00",
    galleryStatus: "in_progress"
  },
  {
    id: "B005",
    clientName: "Roberts Family",
    clientEmail: "roberts@example.com",
    clientPhone: "+27 73 678 9012",
    service: "Funeral Service Documentation",
    category: "Photography",
    subcategory: "Funeral",
    date: "2025-04-15T09:00:00",
    location: "Sunset Memorial Park",
    status: "completed",
    staff: "Emily Davis",
    price: 2800,
    notes: "Respectful documentation of service and gathering",
    createdAt: "2025-01-02T13:30:00",
    galleryStatus: "delivered"
  },
  {
    id: "B006",
    clientName: "Green Living Co",
    clientEmail: "marketing@greenliving.com",
    clientPhone: "+27 74 789 0123",
    service: "Product Promotional Video",
    category: "Videography",
    subcategory: "Commercial Videography",
    date: "2025-05-05T10:00:00",
    location: "Studio",
    status: "completed",
    staff: "Michael Chen",
    price: 4500,
    notes: "30-second promotional video for social media",
    createdAt: "2024-12-20T15:10:00",
    galleryStatus: "delivered"
  },
  {
    id: "B007",
    clientName: "David Williams",
    clientEmail: "david@example.com",
    clientPhone: "+27 76 890 1234",
    service: "Professional Headshots",
    category: "Photography",
    subcategory: "Portrait",
    date: "2025-06-10T14:00:00",
    location: "Studio",
    status: "canceled",
    staff: null,
    price: 800,
    notes: "Client canceled due to schedule conflict",
    createdAt: "2025-01-08T10:20:00",
    canceledAt: "2025-01-18T16:45:00",
    cancelReason: "Client schedule conflict",
    galleryStatus: "not_applicable"
  }
];

// Mock staff members for assignment
const staffMembers = [
  { id: "S1", name: "Emily Davis", specialty: "Wedding, Portrait, Funeral" },
  { id: "S2", name: "Michael Chen", specialty: "Commercial, Event" },
  { id: "S3", name: "John Wilson", specialty: "Videography, Live Streaming" },
  { id: "S4", name: "Sarah Johnson", specialty: "Portrait, Commercial" }
];

// Services categories and subcategories
const serviceCategories = {
  "Photography": [
    "Wedding",
    "Funeral",
    "Portrait",
    "Commercial",
    "Event Photography"
  ],
  "Videography": [
    "Wedding",
    "Funeral",
    "Short Films / Documentaries",
    "Commercial Videography",
    "Live Streaming Services"
  ],
  "AI Training": [
    "AI Basics Bootcamp",
    "AI for Business Integration",
    "Build Your AI Agent (Advanced)",
    "On-site or remote delivery"
  ],
  "Web & App Development": [
    "Full-stack website design and hosting",
    "Mobile app interface design",
    "Client login system",
    "Membership dashboards"
  ],
  "Digital Marketing": [
    "Social media ads",
    "Campaign strategy",
    "Content creation",
    "Brand awareness programs"
  ],
  "Printing Services": [
    "Business cards, flyers, banners",
    "Event printing (programs, signage)",
    "Custom t-shirts, mugs, and promotional materials"
  ]
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false);
  const [isAssignStaffDialogOpen, setIsAssignStaffDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [newBookingData, setNewBookingData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    service: "",
    category: "",
    subcategory: "",
    date: "",
    time: "",
    location: "",
    price: "",
    notes: ""
  });

  // Filter bookings by tab and search term
  const filterBookings = (status, term = searchTerm) => {
    if (status === "all") {
      return bookings.filter(booking => 
        (booking.clientName.toLowerCase().includes(term.toLowerCase()) ||
        booking.service.toLowerCase().includes(term.toLowerCase()) ||
        booking.id.toLowerCase().includes(term.toLowerCase()))
      );
    }
    
    return bookings.filter(booking => 
      booking.status === status && 
      (booking.clientName.toLowerCase().includes(term.toLowerCase()) ||
      booking.service.toLowerCase().includes(term.toLowerCase()) ||
      booking.id.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  const handleCreateNewBooking = () => {
    const newBooking = {
      id: `B00${bookings.length + 1}`,
      clientName: newBookingData.clientName,
      clientEmail: newBookingData.clientEmail,
      clientPhone: newBookingData.clientPhone,
      service: `${newBookingData.subcategory} ${newBookingData.category}`,
      category: newBookingData.category,
      subcategory: newBookingData.subcategory,
      date: `${newBookingData.date}T${newBookingData.time}`,
      location: newBookingData.location,
      status: "pending",
      staff: null,
      price: parseFloat(newBookingData.price),
      notes: newBookingData.notes,
      createdAt: new Date().toISOString(),
      galleryStatus: "not_started"
    };

    setBookings([...bookings, newBooking]);
    setIsNewBookingDialogOpen(false);
    setNewBookingData({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      service: "",
      category: "",
      subcategory: "",
      date: "",
      time: "",
      location: "",
      price: "",
      notes: ""
    });

    toast({
      title: "Booking Created",
      description: `New booking for ${newBooking.clientName} has been created.`,
    });
  };

  const handleAssignStaff = (bookingId, staffId) => {
    const updatedBookings = bookings.map(booking => {
      if (booking.id === bookingId) {
        const assignedStaff = staffMembers.find(staff => staff.id === staffId);
        return {
          ...booking,
          staff: assignedStaff.name,
          status: booking.status === "pending" ? "upcoming" : booking.status
        };
      }
      return booking;
    });

    setBookings(updatedBookings);
    setIsAssignStaffDialogOpen(false);

    toast({
      title: "Staff Assigned",
      description: `Staff has been assigned to booking #${bookingId}.`,
    });
  };

  const handleApproveBooking = (bookingId) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: "upcoming" } : booking
    );
    setBookings(updatedBookings);

    toast({
      title: "Booking Approved",
      description: `Booking #${bookingId} has been approved.`,
    });
  };

  const handleRejectBooking = (bookingId) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        status: "canceled",
        canceledAt: new Date().toISOString(),
        cancelReason: "Rejected by admin",
        galleryStatus: "not_applicable"
      } : booking
    );
    setBookings(updatedBookings);

    toast({
      title: "Booking Rejected",
      description: `Booking #${bookingId} has been rejected.`,
    });
  };

  const handleMarkAsComplete = (bookingId) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        status: "completed",
        galleryStatus: "delivered" 
      } : booking
    );
    setBookings(updatedBookings);

    toast({
      title: "Booking Completed",
      description: `Booking #${bookingId} has been marked as completed.`,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("");
    setNewBookingData({
      ...newBookingData,
      category: category,
      subcategory: ""
    });
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setNewBookingData({
      ...newBookingData,
      subcategory: subcategory
    });
  };

  // Booking status badge colors
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'ongoing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">Manage all bookings and appointments</p>
        </div>
        
        <Button onClick={() => setIsNewBookingDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bookings..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Tabs for different booking statuses */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>
        
        {/* Tab content for all tabs */}
        {["all", "upcoming", "pending", "ongoing", "completed", "canceled"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Bookings
                </CardTitle>
                <CardDescription>
                  {filterBookings(tabValue).length} bookings found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="hidden lg:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Staff</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterBookings(tabValue).length > 0 ? (
                        filterBookings(tabValue).map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{booking.clientName}</TableCell>
                            <TableCell>{booking.service}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDate(booking.date)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {booking.staff || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => viewBookingDetails(booking)}
                                >
                                  View
                                </Button>
                                
                                {booking.status === "pending" && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                      onClick={() => handleApproveBooking(booking.id)}
                                    >
                                      <Check className="h-4 w-4 mr-1" /> 
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                      onClick={() => handleRejectBooking(booking.id)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                
                                {(booking.status === "upcoming" || booking.status === "pending") && !booking.staff && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setIsAssignStaffDialogOpen(true);
                                    }}
                                  >
                                    <Users className="h-4 w-4 mr-1" />
                                    Assign
                                  </Button>
                                )}
                                
                                {booking.status === "ongoing" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleMarkAsComplete(booking.id)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No bookings found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Client Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedBooking.clientName}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.clientEmail}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBooking.clientPhone}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Booking Overview</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">ID:</span> {selectedBooking.id}</p>
                    <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedBooking.status)}`}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span></p>
                    <p><span className="font-medium">Assigned To:</span> {selectedBooking.staff || "Not assigned"}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Service Details</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Service:</span> {selectedBooking.service}</p>
                    <p><span className="font-medium">Date & Time:</span> {formatDate(selectedBooking.date)}</p>
                    <p><span className="font-medium">Location:</span> {selectedBooking.location}</p>
                    <p><span className="font-medium">Price:</span> R{selectedBooking.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
                  <p className="mt-2">{selectedBooking.notes || "No additional notes"}</p>
                </div>
                
                {selectedBooking.status === "canceled" && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Cancellation Details</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Canceled On:</span> {formatDate(selectedBooking.canceledAt)}</p>
                      <p><span className="font-medium">Reason:</span> {selectedBooking.cancelReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            {selectedBooking && selectedBooking.status === "pending" && (
              <>
                <Button 
                  variant="outline" 
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  onClick={() => {
                    handleApproveBooking(selectedBooking.id);
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" /> 
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  onClick={() => {
                    handleRejectBooking(selectedBooking.id);
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            
            {selectedBooking && (selectedBooking.status === "upcoming" || selectedBooking.status === "pending") && !selectedBooking.staff && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  setIsAssignStaffDialogOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-1" />
                Assign Staff
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Booking Dialog */}
      <Dialog open={isNewBookingDialogOpen} onOpenChange={setIsNewBookingDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Add a new booking to the system manually
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column - Client Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input 
                  id="clientName" 
                  placeholder="Enter client name"
                  value={newBookingData.clientName}
                  onChange={(e) => setNewBookingData({...newBookingData, clientName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input 
                  id="clientEmail" 
                  type="email" 
                  placeholder="Enter client email"
                  value={newBookingData.clientEmail}
                  onChange={(e) => setNewBookingData({...newBookingData, clientEmail: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input 
                  id="clientPhone" 
                  placeholder="Enter client phone"
                  value={newBookingData.clientPhone}
                  onChange={(e) => setNewBookingData({...newBookingData, clientPhone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Enter booking location"
                  value={newBookingData.location}
                  onChange={(e) => setNewBookingData({...newBookingData, location: e.target.value})}
                />
              </div>
            </div>
            
            {/* Right column - Service Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={handleCategoryChange}
                  value={selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(serviceCategories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subcategory">Service Type</Label>
                <Select 
                  onValueChange={handleSubcategoryChange}
                  value={selectedSubcategory}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCategory ? "Select service type" : "Select category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory && serviceCategories[selectedCategory].map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={newBookingData.date}
                    onChange={(e) => setNewBookingData({...newBookingData, date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={newBookingData.time}
                    onChange={(e) => setNewBookingData({...newBookingData, time: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (R)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="0.00"
                  value={newBookingData.price}
                  onChange={(e) => setNewBookingData({...newBookingData, price: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          {/* Notes - Full width */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Enter any additional booking notes or requirements"
              className="min-h-[100px]"
              value={newBookingData.notes}
              onChange={(e) => setNewBookingData({...newBookingData, notes: e.target.value})}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewBookingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewBooking}
              disabled={!newBookingData.clientName || !newBookingData.category || !newBookingData.subcategory || !newBookingData.date || !newBookingData.time}
            >
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Staff Dialog */}
      <Dialog open={isAssignStaffDialogOpen} onOpenChange={setIsAssignStaffDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Staff Member</DialogTitle>
            <DialogDescription>
              Select a staff member to assign to this booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Booking Details</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.service} | {formatDate(selectedBooking.date)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Select Staff Member</Label>
                <Select onValueChange={(value) => handleAssignStaff(selectedBooking.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} - {staff.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignStaffDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
