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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface NewBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    newBookingData: {
        clientName: string;
        clientEmail: string;
        clientPhone: string;
        service: string;
        category: string;
        subcategory: string;
        date: string;
        time: string;
        location: string;
        price: string;
        notes: string;
    };
    setNewBookingData: React.Dispatch<React.SetStateAction<NewBookingDialogProps["newBookingData"]>>;
    selectedCategory: string;
    selectedSubcategory: string;
    serviceCategories: Record<string, string[]>;
    onCategoryChange: (category: string) => void;
    onSubcategoryChange: (subcategory: string) => void;
    onCreateBooking: () => void;
}

const NewBookingDialog: React.FC<NewBookingDialogProps> = ({
    open,
    onOpenChange,
    newBookingData,
    setNewBookingData,
    selectedCategory,
    selectedSubcategory,
    serviceCategories,
    onCategoryChange,
    onSubcategoryChange,
    onCreateBooking,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                    <DialogDescription>Add a new booking to the system manually</DialogDescription>
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
                                onChange={(e) => setNewBookingData({ ...newBookingData, clientName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clientEmail">Client Email</Label>
                            <Input
                                id="clientEmail"
                                type="email"
                                placeholder="Enter client email"
                                value={newBookingData.clientEmail}
                                onChange={(e) => setNewBookingData({ ...newBookingData, clientEmail: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clientPhone">Client Phone</Label>
                            <Input
                                id="clientPhone"
                                placeholder="Enter client phone"
                                value={newBookingData.clientPhone}
                                onChange={(e) => setNewBookingData({ ...newBookingData, clientPhone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="Enter booking location"
                                value={newBookingData.location}
                                onChange={(e) => setNewBookingData({ ...newBookingData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Right column - Service Information */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={onCategoryChange} value={selectedCategory}>
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
                            <Select onValueChange={onSubcategoryChange} value={selectedSubcategory} disabled={!selectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedCategory ? "Select service type" : "Select category first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedCategory &&
                                        serviceCategories[selectedCategory].map((subcategory) => (
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
                                    onChange={(e) => setNewBookingData({ ...newBookingData, date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={newBookingData.time}
                                    onChange={(e) => setNewBookingData({ ...newBookingData, time: e.target.value })}
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
                                onChange={(e) => setNewBookingData({ ...newBookingData, price: e.target.value })}
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
                        onChange={(e) => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onCreateBooking}
                        disabled={!newBookingData.clientName || !newBookingData.category || !newBookingData.subcategory || !newBookingData.date || !newBookingData.time}
                    >
                        Create Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewBookingDialog;
