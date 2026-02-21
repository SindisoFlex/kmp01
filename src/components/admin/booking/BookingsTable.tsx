import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, FileText, Users, X } from "lucide-react";

type AdminBooking = {
    id: string;
    clientName: string;
    service: string;
    date: string;
    status: string;
    staff: string | null;
    payment_status?: "pending" | "paid";
    [key: string]: unknown;
};

interface BookingsTableProps {
    bookings: AdminBooking[];
    formatDate: (dateString: string) => string;
    getStatusBadgeClass: (status: string) => string;
    onViewDetails: (booking: AdminBooking) => void;
    onApprove: (bookingId: string) => void;
    onReject: (bookingId: string) => void;
    onAssignStaff: (booking: AdminBooking) => void;
    onMarkComplete: (bookingId: string) => void;
    onMarkPaid: (bookingId: string) => void;
    isMarkingPaid: boolean;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
    bookings,
    formatDate,
    getStatusBadgeClass,
    onViewDetails,
    onApprove,
    onReject,
    onAssignStaff,
    onMarkComplete,
    onMarkPaid,
    isMarkingPaid,
}) => {
    return (
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
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.id}</TableCell>
                                <TableCell>{booking.clientName}</TableCell>
                                <TableCell>{booking.service}</TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(booking.date)}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">{booking.staff || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onViewDetails(booking)}>
                                            View
                                        </Button>

                                        {booking.status === "pending" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                                    onClick={() => onApprove(booking.id)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                                    onClick={() => onReject(booking.id)}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> Reject
                                                </Button>
                                            </>
                                        )}

                                        {(booking.status === "upcoming" || booking.status === "pending") && !booking.staff && (
                                            <Button variant="outline" size="sm" onClick={() => onAssignStaff(booking)}>
                                                <Users className="h-4 w-4 mr-1" /> Assign
                                            </Button>
                                        )}

                                        {booking.status === "ongoing" && (
                                            <Button variant="outline" size="sm" onClick={() => onMarkComplete(booking.id)}>
                                                <Check className="h-4 w-4 mr-1" /> Complete
                                            </Button>
                                        )}

                                        {booking.payment_status !== "paid" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onMarkPaid(booking.id)}
                                                disabled={isMarkingPaid}
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                {isMarkingPaid ? "Processing..." : "Mark Paid"}
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
    );
};

export default BookingsTable;
