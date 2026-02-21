import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AdminBooking = {
    id: string;
    service: string;
    date: string;
    [key: string]: unknown;
};

type StaffMember = {
    id: string;
    name: string;
    specialty: string;
};

interface AssignStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: AdminBooking | null;
    staffMembers: StaffMember[];
    formatDate: (dateString: string) => string;
    onAssignStaff: (bookingId: string, staffId: string) => void;
}

const AssignStaffDialog: React.FC<AssignStaffDialogProps> = ({
    open,
    onOpenChange,
    booking,
    staffMembers,
    formatDate,
    onAssignStaff,
}) => {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Staff Member</DialogTitle>
                    <DialogDescription>Select a staff member to assign to this booking</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium">Booking Details</h3>
                        <p className="text-sm text-muted-foreground">
                            {booking.service} | {formatDate(booking.date)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Staff Member</Label>
                        <Select onValueChange={(value) => onAssignStaff(booking.id, value)}>
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

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AssignStaffDialog;
