
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Image,
  Upload,
  Users,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Plus,
  CalendarCheck,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Lock,
  Share2,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

// Sample data for client galleries
const mockGalleries = [
  {
    id: 1,
    title: "Johnson Wedding",
    client: "Sarah Johnson",
    date: new Date("2023-05-15"),
    count: 127,
    visibility: "private",
    expiration: new Date("2024-05-15"),
    thumbnail: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    title: "Tech Company Headshots",
    client: "Michael Brown",
    date: new Date("2023-06-22"),
    count: 45,
    visibility: "private",
    expiration: new Date("2024-06-22"),
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 3,
    title: "Summer Collection",
    client: "Fashion Brand",
    date: new Date("2023-07-10"),
    count: 84,
    visibility: "public",
    expiration: null,
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 4,
    title: "Davis Family Portraits",
    client: "Olivia Davis",
    date: new Date("2023-08-05"),
    count: 62,
    visibility: "private",
    expiration: new Date("2024-08-05"),
    thumbnail: "https://images.unsplash.com/photo-1581952976147-5a2d15560349?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 5,
    title: "Product Showcase",
    client: "E-commerce Corp",
    date: new Date("2023-09-14"),
    count: 53,
    visibility: "public",
    expiration: null,
    thumbnail: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 6,
    title: "Wilson Corporate Event",
    client: "Benjamin Wilson",
    date: new Date("2023-10-20"),
    count: 98,
    visibility: "private",
    expiration: new Date("2024-10-20"),
    thumbnail: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
];

const ClientGalleryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [newGalleryOpen, setNewGalleryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [galleryVisibility, setGalleryVisibility] = useState<string>("private");
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<typeof mockGalleries[0] | null>(null);
  
  const filteredGalleries = mockGalleries.filter(gallery => {
    if (activeTab === "all") return true;
    if (activeTab === "public") return gallery.visibility === "public";
    if (activeTab === "private") return gallery.visibility === "private";
    if (activeTab === "expiring") {
      if (!gallery.expiration) return false;
      // Show galleries expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return gallery.expiration < thirtyDaysFromNow;
    }
    return true;
  });
  
  const handleCreateGallery = () => {
    // In a real app, this would send data to the server
    toast({
      title: "Gallery Created",
      description: "New gallery has been created and is ready for uploads."
    });
    setNewGalleryOpen(false);
  };
  
  const handleExtendExpiration = () => {
    // In a real app, this would update the expiration date
    toast({
      title: "Expiration Extended",
      description: `Gallery access extended to ${expirationDate ? format(expirationDate, "PPP") : "N/A"}`
    });
    setExtensionDialogOpen(false);
  };
  
  const handleVisibilityChange = (gallery: typeof mockGalleries[0], newVisibility: string) => {
    // In a real app, this would update the gallery visibility
    toast({
      title: "Visibility Changed",
      description: `Gallery "${gallery.title}" is now ${newVisibility}`
    });
  };
  
  const handleNotifyClient = (gallery: typeof mockGalleries[0]) => {
    // In a real app, this would send a notification to the client
    toast({
      title: "Client Notified",
      description: `${gallery.client} has been notified about their gallery`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
            <TabsTrigger value="expiring">Expiring</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Dialog open={newGalleryOpen} onOpenChange={setNewGalleryOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Gallery
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Gallery</DialogTitle>
              <DialogDescription>
                Create a new photo gallery for a client or public showcase
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gallery-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="gallery-title"
                  placeholder="Enter gallery title"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gallery-client" className="text-right">
                  Client
                </Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger id="gallery-client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Brown</SelectItem>
                      <SelectItem value="emma">Emma Williams</SelectItem>
                      <SelectItem value="james">James Smith</SelectItem>
                      <SelectItem value="olivia">Olivia Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gallery-date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gallery-visibility" className="text-right">
                  Visibility
                </Label>
                <div className="col-span-3">
                  <Select 
                    defaultValue="private"
                    value={galleryVisibility}
                    onValueChange={setGalleryVisibility}
                  >
                    <SelectTrigger id="gallery-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (Client Only)</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {galleryVisibility === "private" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gallery-expiration" className="text-right">
                    Expiration
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expirationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarCheck className="mr-2 h-4 w-4" />
                          {expirationDate ? format(expirationDate, "PPP") : "Set expiration date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expirationDate}
                          onSelect={setExpirationDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewGalleryOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGallery}>
                Create Gallery
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGalleries.map((gallery) => (
          <Card key={gallery.id} className="overflow-hidden">
            <div className="relative h-48">
              <img 
                src={gallery.thumbnail} 
                alt={gallery.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 right-0 p-2 flex gap-2">
                <Badge variant={gallery.visibility === "public" ? "default" : "outline"}
                  className={gallery.visibility === "public" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300"}
                >
                  {gallery.visibility === "public" ? "Public" : "Private"}
                </Badge>
                {gallery.expiration && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    Expires {format(new Date(gallery.expiration), "MMM d, yyyy")}
                  </Badge>
                )}
              </div>
            </div>
            <CardHeader>
              <CardTitle>{gallery.title}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  {gallery.client}
                </span>
                <span className="flex items-center text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {format(new Date(gallery.date), "MMM d, yyyy")}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{gallery.count}</span> photos
                </div>
                {gallery.visibility === "private" && gallery.expiration && (
                  <Dialog open={extensionDialogOpen && selectedGallery?.id === gallery.id} onOpenChange={(open) => {
                    if (!open) setExtensionDialogOpen(false);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedGallery(gallery);
                          setExpirationDate(new Date(gallery.expiration!));
                          setExtensionDialogOpen(true);
                        }}
                      >
                        Extend Access
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Extend Gallery Access</DialogTitle>
                        <DialogDescription>
                          Current expiration: {format(new Date(gallery.expiration!), "PPP")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label>New Expiration Date</Label>
                        <div className="mt-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarCheck className="mr-2 h-4 w-4" />
                                {expirationDate ? format(expirationDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={expirationDate}
                                onSelect={setExpirationDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="mt-4">
                          <Label>Extension Fee</Label>
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">R100.00</p>
                            <p className="text-xs text-muted-foreground">Fee for extending access by one year</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setExtensionDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleExtendExpiration}>
                          Extend Access
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Gallery Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNotifyClient(gallery)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Notify Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleVisibilityChange(gallery, gallery.visibility === "public" ? "private" : "public")}>
                    {gallery.visibility === "public" ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Make Private
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Make Public
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Gallery
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
        
        {filteredGalleries.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center bg-muted p-8 rounded-lg">
            <Image className="h-16 w-16 text-muted-foreground opacity-30" />
            <h3 className="mt-4 font-medium">No galleries found</h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === "all" 
                ? "Create your first gallery to get started" 
                : `No ${activeTab} galleries available`}
            </p>
            <Button className="mt-4" onClick={() => setNewGalleryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Gallery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientGalleryManager;
