
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Search } from "lucide-react";
import { adminMarkBookingPaid } from "@/services/invoiceService";
import { formatCurrency } from "@/utils/formatting";
import BookingsTable from "@/components/admin/booking/BookingsTable";
import BookingDetailsDialog from "@/components/admin/booking/BookingDetailsDialog";
import NewBookingDialog from "@/components/admin/booking/NewBookingDialog";
import AssignStaffDialog from "@/components/admin/booking/AssignStaffDialog";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { Skeleton } from "@/components/ui/skeleton";
import { createBooking } from "@/services/bookingService";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type AdminBooking = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  category: string;
  subcategory: string;
  date: string;
  location: string;
  status: string;
  staff: string | null;
  price: number;
  notes: string;
  createdAt: string;
  galleryStatus: string;
  canceledAt?: string;
  cancelReason?: string;
  payment_status?: "pending" | "paid";
  invoice_number?: string;
};

// Removed static mockBookings and staffMembers arrays

const serviceCategories: Record<string, string[]> = {
  "Photography": ["Wedding", "Funeral", "Portrait", "Commercial", "Event Photography"],
  "Videography": ["Wedding", "Funeral", "Short Films / Documentaries", "Commercial Videography", "Live Streaming Services"],
  "AI Training": ["AI Basics Bootcamp", "AI for Business Integration", "Build Your AI Agent (Advanced)", "On-site or remote delivery"],
  "Web & App Development": ["Full-stack website design and hosting", "Mobile app interface design", "Client login system", "Membership dashboards"],
  "Digital Marketing": ["Social media ads", "Campaign strategy", "Content creation", "Brand awareness programs"],
  "Printing Services": ["Business cards, flyers, banners", "Event printing (programs, signage)", "Custom t-shirts, mugs, and promotional materials"]
};

const AdminBookings: React.FC = () => {
  const queryClient = useQueryClient();
  const { bookings, isLoading, staffMembers, approveBooking, rejectBooking, completeBooking } = useAdminBookings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
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
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // ── Filters ─────────────────────────────────────────────────────
  const filterBookings = (status: string, term = searchTerm) => {
    const base = status === "all" ? bookings : bookings.filter((b) => b.status === status);
    return base.filter(
      (b) =>
        b.clientName.toLowerCase().includes(term.toLowerCase()) ||
        b.service.toLowerCase().includes(term.toLowerCase()) ||
        b.id.toLowerCase().includes(term.toLowerCase())
    );
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "ongoing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // ── Handlers ────────────────────────────────────────────────────
  const handleCreateNewBooking = async () => {
    try {
      await createBooking({
        service: newBookingData.category, // Backend uses service as the primary type
        category: newBookingData.subcategory,
        date: `${newBookingData.date}T${newBookingData.time}`,
        location: newBookingData.location,
        description: newBookingData.notes,
        extras: []
      });

      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setIsNewBookingDialogOpen(false);
      setNewBookingData({ clientName: "", clientEmail: "", clientPhone: "", service: "", category: "", subcategory: "", date: "", time: "", location: "", price: "", notes: "" });
      toast({ title: "Booking Created", description: `New booking has been created and synced.` });
    } catch (err: any) {
      toast({ title: "Failed to create booking", description: err.message, variant: "destructive" });
    }
  };

  const handleAssignStaff = async (bookingId: string, staffId: string) => {
    // Requires a mapping to actual staff profiles in backend. Skipping raw DB array manipulation for safety if staff_id column doesn't exist.
    toast({ title: "Task Logged", description: `Staff logic requires schema link. (Logged for booking: ${bookingId})` });
    setIsAssignStaffDialogOpen(false);
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await approveBooking(bookingId);
      toast({ title: "Booking Approved", description: `Booking #${bookingId} has been approved.` });
    } catch {
      toast({ title: "Error", description: "Could not approve booking.", variant: "destructive" });
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await rejectBooking(bookingId);
      toast({ title: "Booking Rejected", description: `Booking #${bookingId} has been rejected.` });
    } catch {
      toast({ title: "Error", description: "Could not reject booking.", variant: "destructive" });
    }
  };

  const handleMarkAsComplete = async (bookingId: string) => {
    try {
      await completeBooking(bookingId);
      toast({ title: "Booking Completed", description: `Booking #${bookingId} has been marked as completed.` });
    } catch {
      toast({ title: "Error", description: "Could not complete booking.", variant: "destructive" });
    }
  };

  const isUuid = (value: unknown) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value));

  const handleMarkAsPaid = async (bookingId: string) => {
    if (!isUuid(bookingId)) {
      toast({ title: "Cannot mark paid", description: "This record is demo data. Only real database bookings can be marked as paid.", variant: "destructive" });
      return;
    }
    setIsMarkingPaid(true);
    try {
      const result = await adminMarkBookingPaid(bookingId);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      const tokensMsg = result?.tokens_awarded ? ` ${result.tokens_awarded} tokens awarded.` : "";
      toast({ title: "Payment confirmed ✓", description: `Invoice ${result?.invoice_number || ""} created.${tokensMsg}` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast({ title: "Failed to confirm payment", description: message, variant: "destructive" });
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory("");
    setNewBookingData({ ...newBookingData, category, subcategory: "" });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setNewBookingData({ ...newBookingData, subcategory });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-[200px]" /><Skeleton className="h-10 w-[120px]" /></div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

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

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search bookings..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>

        {["all", "upcoming", "pending", "ongoing", "completed", "canceled"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Bookings
                </CardTitle>
                <CardDescription>{filterBookings(tabValue).length} bookings found</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsTable
                  bookings={filterBookings(tabValue)}
                  formatDate={formatDate}
                  getStatusBadgeClass={getStatusBadgeClass}
                  onViewDetails={(booking) => { setSelectedBooking(booking as AdminBooking); setIsDetailsDialogOpen(true); }}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                  onAssignStaff={(booking) => { setSelectedBooking(booking as AdminBooking); setIsAssignStaffDialogOpen(true); }}
                  onMarkComplete={handleMarkAsComplete}
                  onMarkPaid={handleMarkAsPaid}
                  isMarkingPaid={isMarkingPaid}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialogs */}
      <BookingDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        booking={selectedBooking}
        formatDate={formatDate}
        getStatusBadgeClass={getStatusBadgeClass}
        onApprove={handleApproveBooking}
        onReject={handleRejectBooking}
        onOpenAssignStaff={() => setIsAssignStaffDialogOpen(true)}
      />

      <NewBookingDialog
        open={isNewBookingDialogOpen}
        onOpenChange={setIsNewBookingDialogOpen}
        newBookingData={newBookingData}
        setNewBookingData={setNewBookingData}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        serviceCategories={serviceCategories}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
        onCreateBooking={handleCreateNewBooking}
      />

      <AssignStaffDialog
        open={isAssignStaffDialogOpen}
        onOpenChange={setIsAssignStaffDialogOpen}
        booking={selectedBooking}
        staffMembers={staffMembers}
        formatDate={formatDate}
        onAssignStaff={handleAssignStaff}
      />
    </div>
  );
};

export default AdminBookings;
