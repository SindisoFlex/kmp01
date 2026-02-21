import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Users, X } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";

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

interface BookingDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: AdminBooking | null;
    formatDate: (dateString: string) => string;
    getStatusBadgeClass: (status: string) => string;
    onApprove: (bookingId: string) => void;
    onReject: (bookingId: string) => void;
    onOpenAssignStaff: () => void;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
    open,
    onOpenChange,
    booking,
    formatDate,
    getStatusBadgeClass,
    onApprove,
    onReject,
    onOpenAssignStaff,
}) => {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Client Information</h3>
                            <div className="mt-2 space-y-2">
                                <p><span className="font-medium">Name:</span> {booking.clientName}</p>
                                <p><span className="font-medium">Email:</span> {booking.clientEmail}</p>
                                <p><span className="font-medium">Phone:</span> {booking.clientPhone}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Booking Overview</h3>
                            <div className="mt-2 space-y-2">
                                <p><span className="font-medium">ID:</span> {booking.id}</p>
                                <p>
                                    <span className="font-medium">Status:</span>{" "}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </p>
                                <p><span className="font-medium">Assigned To:</span> {booking.staff || "Not assigned"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Service Details</h3>
                            <div className="mt-2 space-y-2">
                                <p><span className="font-medium">Service:</span> {booking.service}</p>
                                <p><span className="font-medium">Date &amp; Time:</span> {formatDate(booking.date)}</p>
                                <p><span className="font-medium">Location:</span> {booking.location}</p>
                                <p><span className="font-medium">Price:</span> {formatCurrency(booking.price, "ZAR")}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
                            <p className="mt-2">{booking.notes || "No additional notes"}</p>
                        </div>

                        {booking.status === "canceled" && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Cancellation Details</h3>
                                <div className="mt-2 space-y-2">
                                    <p><span className="font-medium">Canceled On:</span> {formatDate(booking.canceledAt!)}</p>
                                    <p><span className="font-medium">Reason:</span> {booking.cancelReason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    {booking.status === "pending" && (
                        <>
                            <Button
                                variant="outline"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                onClick={() => { onApprove(booking.id); onOpenChange(false); }}
                            >
                                <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                onClick={() => { onReject(booking.id); onOpenChange(false); }}
                            >
                                <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                        </>
                    )}

                    {(booking.status === "upcoming" || booking.status === "pending") && !booking.staff && (
                        <Button
                            variant="outline"
                            onClick={() => { onOpenChange(false); onOpenAssignStaff(); }}
                        >
                            <Users className="h-4 w-4 mr-1" /> Assign Staff
                        </Button>
                    )}

                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookingDetailsDialog;
