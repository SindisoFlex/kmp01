
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InfoIcon } from "lucide-react";

const RefundPolicy: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
          Cancellation & Refund Policy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Refunds are available for cancelled bookings based on how far in advance the cancellation is made:
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notice Period</TableHead>
              <TableHead>Refund Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>More than 14 days</TableCell>
              <TableCell>Full refund (100%)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>7-14 days</TableCell>
              <TableCell>Partial refund (75%)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3-7 days</TableCell>
              <TableCell>Partial refund (50%)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>1-3 days</TableCell>
              <TableCell>Partial refund (25%)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Less than 24 hours</TableCell>
              <TableCell>No refund (0%)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div className="mt-4 text-sm">
          <p className="font-medium">To request a refund or cancel a booking:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Navigate to your booking details</li>
            <li>Click on the "Cancel Booking" button</li>
            <li>Choose a reason for cancellation</li>
            <li>Submit your request</li>
          </ol>
          <p className="mt-3">
            Our team will review your request and process any applicable refund within 5-7 business days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefundPolicy;
