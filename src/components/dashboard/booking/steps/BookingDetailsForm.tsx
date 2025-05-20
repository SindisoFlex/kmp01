
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range";
import { Upload, MapPin } from "lucide-react";

interface BookingDetailsFormProps {
  bookingDetails: {
    date?: Date;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    attachments: File[];
  };
  onUpdate: (details: Partial<BookingDetailsFormProps['bookingDetails']>) => void;
}

const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({ bookingDetails, onUpdate }) => {
  const [attachments, setAttachments] = useState<File[]>(bookingDetails.attachments || []);
  
  const form = useForm({
    defaultValues: {
      date: bookingDetails.date,
      startTime: bookingDetails.startTime,
      endTime: bookingDetails.endTime,
      location: bookingDetails.location,
      description: bookingDetails.description,
    }
  });
  
  const handleDateChange = (date: Date | undefined) => {
    onUpdate({ date });
    form.setValue('date', date);
  };
  
  const handleInputChange = (field: string, value: string) => {
    onUpdate({ [field]: value } as any);
    form.setValue(field as any, value);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updatedAttachments = [...attachments, ...newFiles];
      setAttachments(updatedAttachments);
      onUpdate({ attachments: updatedAttachments });
    }
  };
  
  const removeAttachment = (index: number) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
    onUpdate({ attachments: updatedAttachments });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Preferred Date</label>
          <CalendarDateRangePicker 
            date={bookingDetails.date} 
            onDateChange={handleDateChange} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <Input 
              type="time" 
              value={bookingDetails.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <Input 
              type="time" 
              value={bookingDetails.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            <MapPin className="h-4 w-4 inline-block mr-1" />
            Location
          </label>
          <Input 
            placeholder="Enter event location" 
            value={bookingDetails.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Specify the physical address or venue name
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description / Notes</label>
          <Textarea 
            placeholder="Provide any additional details about your requirements..." 
            className="min-h-[120px]"
            value={bookingDetails.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            <Upload className="h-4 w-4 inline-block mr-1" />
            Attachments (optional)
          </label>
          <div className="mt-1 flex items-center">
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                Upload Files
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleFileChange}
              />
            </label>
            <span className="ml-3 text-sm text-muted-foreground">
              Upload reference images or documents
            </span>
          </div>
          
          {/* Display attached files */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">Attached Files:</p>
              <ul className="space-y-1">
                {attachments.map((file, index) => (
                  <li key={index} className="text-sm flex items-center justify-between bg-muted/50 rounded-sm px-3 py-1">
                    <span>{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsForm;
