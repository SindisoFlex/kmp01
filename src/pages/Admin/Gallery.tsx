
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  GalleryHorizontal,
  Upload,
  Search,
  Eye,
  Edit,
  Trash2,
  Image,
  Video,
  User,
  Calendar,
  Download,
  Link,
  Plus
} from "lucide-react";
import { useAdminGalleries } from "@/hooks/useAdminGalleries";
import { Skeleton } from "@/components/ui/skeleton";

// Removed static mockGalleries array

// Gallery categories
const categories = [
  { value: "wedding", label: "Wedding" },
  { value: "portrait", label: "Portrait" },
  { value: "event", label: "Event" },
  { value: "corporate", label: "Corporate" },
  { value: "funeral", label: "Funeral" },
  { value: "commercial", label: "Commercial" }
];

// Removed mock clients and staff arrays

const GalleryManagement: React.FC = () => {
  const { galleries, isLoading, clientsList: clients, staffList: staff, createGallery, updateGallery, deleteGallery } = useAdminGalleries();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [isAddGalleryOpen, setIsAddGalleryOpen] = useState(false);
  const [isEditGalleryOpen, setIsEditGalleryOpen] = useState(false);
  const [isDeleteGalleryOpen, setIsDeleteGalleryOpen] = useState(false);
  const [isViewGalleryOpen, setIsViewGalleryOpen] = useState(false);

  const [currentGallery, setCurrentGallery] = useState<any>(null);
  const [newGallery, setNewGallery] = useState({
    title: "",
    category: "wedding",
    description: "",
    clientId: "",
    date: new Date().toISOString().split('T')[0],
    photographerId: "",
    type: "private",
    downloadEnabled: true,
    featured: false,
    expiresIn: "24" // months
  });

  // Get filtered galleries based on active tab, search query, and category filter
  const getFilteredGalleries = () => {
    let filtered = galleries;

    // Filter by tab (gallery type)
    if (activeTab === "public") {
      filtered = filtered.filter(gallery => gallery.type === "public");
    } else if (activeTab === "private") {
      filtered = filtered.filter(gallery => gallery.type === "private");
    } else if (activeTab === "featured") {
      filtered = filtered.filter(gallery => gallery.featured);
    }

    // Filter by category if not "all"
    if (filterCategory !== "all") {
      filtered = filtered.filter(gallery => gallery.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(gallery =>
        gallery.title.toLowerCase().includes(query) ||
        gallery.description.toLowerCase().includes(query) ||
        (gallery.client && gallery.client.toLowerCase().includes(query)) ||
        (gallery.photographer && gallery.photographer.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  // Handle adding a new gallery
  const handleAddGallery = async () => {
    let expirationDate = null;
    if (newGallery.type === "private" && newGallery.expiresIn) {
      const months = parseInt(newGallery.expiresIn);
      const expDate = new Date(newGallery.date);
      expDate.setMonth(expDate.getMonth() + months);
      expirationDate = expDate.toISOString().split('T')[0];
    }

    try {
      await createGallery({
        title: newGallery.title,
        category: newGallery.category,
        description: newGallery.description,
        clientId: newGallery.clientId || null,
        date: newGallery.date,
        photographerId: newGallery.photographerId || null,
        type: newGallery.type,
        downloadEnabled: newGallery.downloadEnabled,
        featured: newGallery.featured,
        expirationDate
      });

      setIsAddGalleryOpen(false);

      // Reset form
      setNewGallery({
        title: "",
        category: "wedding",
        description: "",
        clientId: "",
        date: new Date().toISOString().split('T')[0],
        photographerId: "",
        type: "private",
        downloadEnabled: true,
        featured: false,
        expiresIn: "24"
      });

      toast({
        title: "Gallery Created",
        description: `"${newGallery.title}" gallery has been created successfully.`,
      });
    } catch (err: any) {
      toast({ title: "Failed to create gallery", description: err.message, variant: "destructive" });
    }
  };

  // Handle edit gallery
  const handleEditGallery = async () => {
    try {
      await updateGallery({
        id: currentGallery.id,
        title: currentGallery.title,
        category: currentGallery.category,
        description: currentGallery.description,
        clientId: currentGallery.clientId,
        date: currentGallery.date,
        photographerId: currentGallery.photographerId,
        type: currentGallery.type,
        downloadEnabled: currentGallery.downloadEnabled,
        featured: currentGallery.featured,
        expirationDate: currentGallery.expirationDate,
        status: currentGallery.status
      });
      setIsEditGalleryOpen(false);

      toast({
        title: "Gallery Updated",
        description: `"${currentGallery.title}" gallery has been updated successfully.`,
      });
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  };

  // Handle delete gallery
  const handleDeleteGallery = async () => {
    try {
      await deleteGallery(currentGallery.id);
      setIsDeleteGalleryOpen(false);

      toast({
        title: "Gallery Deleted",
        description: `"${currentGallery.title}" gallery has been deleted.`,
      });
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-[200px]" /><Skeleton className="h-10 w-[120px]" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><Skeleton className="h-[300px]" /><Skeleton className="h-[300px]" /><Skeleton className="h-[300px]" /></div>
      </div>
    );
  }

  const filteredGalleries = getFilteredGalleries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground">Manage public and private photo galleries</p>
        </div>

        <Button onClick={() => setIsAddGalleryOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Create New Gallery
        </Button>
      </div>

      <Card className="card-dashboard">
        <CardHeader className="space-y-0 pb-2">
          <CardTitle>Photo Galleries</CardTitle>
        </CardHeader>

        <div className="px-6">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList className="grid grid-cols-4 sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="public">Public</TabsTrigger>
                <TabsTrigger value="private">Private</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search galleries..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredGalleries.map(gallery => (
                  <GalleryCard
                    key={gallery.id}
                    gallery={gallery}
                    onView={() => {
                      setCurrentGallery(gallery);
                      setIsViewGalleryOpen(true);
                    }}
                    onEdit={() => {
                      setCurrentGallery(gallery);
                      setIsEditGalleryOpen(true);
                    }}
                    onDelete={() => {
                      setCurrentGallery(gallery);
                      setIsDeleteGalleryOpen(true);
                    }}
                  />
                ))}

                {filteredGalleries.length === 0 && (
                  <div className="col-span-full p-6 text-center border rounded-md">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <GalleryHorizontal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Galleries Found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || filterCategory !== "all"
                        ? "Try changing your search terms or filters."
                        : "Get started by creating your first gallery."}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddGalleryOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Gallery
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="public" className="m-0">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredGalleries.map(gallery => (
                  <GalleryCard
                    key={gallery.id}
                    gallery={gallery}
                    onView={() => {
                      setCurrentGallery(gallery);
                      setIsViewGalleryOpen(true);
                    }}
                    onEdit={() => {
                      setCurrentGallery(gallery);
                      setIsEditGalleryOpen(true);
                    }}
                    onDelete={() => {
                      setCurrentGallery(gallery);
                      setIsDeleteGalleryOpen(true);
                    }}
                  />
                ))}

                {filteredGalleries.length === 0 && (
                  <div className="col-span-full p-6 text-center border rounded-md">
                    <p className="text-muted-foreground">No public galleries found.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="private" className="m-0">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredGalleries.map(gallery => (
                  <GalleryCard
                    key={gallery.id}
                    gallery={gallery}
                    onView={() => {
                      setCurrentGallery(gallery);
                      setIsViewGalleryOpen(true);
                    }}
                    onEdit={() => {
                      setCurrentGallery(gallery);
                      setIsEditGalleryOpen(true);
                    }}
                    onDelete={() => {
                      setCurrentGallery(gallery);
                      setIsDeleteGalleryOpen(true);
                    }}
                  />
                ))}

                {filteredGalleries.length === 0 && (
                  <div className="col-span-full p-6 text-center border rounded-md">
                    <p className="text-muted-foreground">No private galleries found.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="m-0">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredGalleries.map(gallery => (
                  <GalleryCard
                    key={gallery.id}
                    gallery={gallery}
                    onView={() => {
                      setCurrentGallery(gallery);
                      setIsViewGalleryOpen(true);
                    }}
                    onEdit={() => {
                      setCurrentGallery(gallery);
                      setIsEditGalleryOpen(true);
                    }}
                    onDelete={() => {
                      setCurrentGallery(gallery);
                      setIsDeleteGalleryOpen(true);
                    }}
                  />
                ))}

                {filteredGalleries.length === 0 && (
                  <div className="col-span-full p-6 text-center border rounded-md">
                    <p className="text-muted-foreground">No featured galleries found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <CardFooter className="border-t mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredGalleries.length} of {galleries.length} galleries
          </p>
        </CardFooter>
      </Card>

      {/* Add Gallery Dialog */}
      <Dialog open={isAddGalleryOpen} onOpenChange={setIsAddGalleryOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Gallery</DialogTitle>
            <DialogDescription>
              Create a new photo gallery and upload images.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Gallery Title</Label>
                <Input
                  id="title"
                  value={newGallery.title}
                  onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                  placeholder="Enter gallery title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newGallery.category}
                  onValueChange={(value) => setNewGallery({ ...newGallery, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Gallery Type</Label>
                <Select
                  value={newGallery.type}
                  onValueChange={(value: "public" | "private") => setNewGallery({ ...newGallery, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Website)</SelectItem>
                    <SelectItem value="private">Private (Client)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newGallery.description}
                onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                placeholder="Enter gallery description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Session Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newGallery.date}
                  onChange={(e) => setNewGallery({ ...newGallery, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photographer">Photographer</Label>
                <Select
                  value={newGallery.photographerId}
                  onValueChange={(value) => setNewGallery({ ...newGallery, photographerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select photographer" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newGallery.type === "private" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                      value={newGallery.clientId}
                      onValueChange={(value) => setNewGallery({ ...newGallery, clientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiration">Gallery Expires After</Label>
                    <Select
                      value={newGallery.expiresIn}
                      onValueChange={(value) => setNewGallery({ ...newGallery, expiresIn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months (2 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="download"
                    checked={newGallery.downloadEnabled}
                    onCheckedChange={(checked) => setNewGallery({ ...newGallery, downloadEnabled: checked })}
                  />
                  <Label htmlFor="download">Enable downloads for this gallery</Label>
                </div>
              </>
            )}

            {newGallery.type === "public" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={newGallery.featured}
                  onCheckedChange={(checked) => setNewGallery({ ...newGallery, featured: checked })}
                />
                <Label htmlFor="featured">Feature this gallery on the website</Label>
              </div>
            )}

            <div className="mt-4 border rounded-md p-4 bg-muted/50">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Upload Photos & Videos</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can upload photos and videos after creating the gallery.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGalleryOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddGallery}
              disabled={!newGallery.title || (!newGallery.photographerId && newGallery.type === "private")}
            >
              Create Gallery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Gallery Dialog */}
      <Dialog open={isEditGalleryOpen} onOpenChange={setIsEditGalleryOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gallery</DialogTitle>
            <DialogDescription>
              Update gallery information and settings.
            </DialogDescription>
          </DialogHeader>
          {currentGallery && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Gallery Title</Label>
                  <Input
                    id="edit-title"
                    value={currentGallery.title}
                    onChange={(e) => setCurrentGallery({ ...currentGallery, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={currentGallery.category}
                    onValueChange={(value) => setCurrentGallery({ ...currentGallery, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Gallery Type</Label>
                  <Select
                    value={currentGallery.type}
                    onValueChange={(value: "public" | "private") => setCurrentGallery({ ...currentGallery, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (Website)</SelectItem>
                      <SelectItem value="private">Private (Client)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentGallery.description}
                  onChange={(e) => setCurrentGallery({ ...currentGallery, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                {currentGallery.type === "private" ? (
                  <Switch
                    id="edit-download"
                    checked={currentGallery.downloadEnabled}
                    onCheckedChange={(checked) => setCurrentGallery({ ...currentGallery, downloadEnabled: checked })}
                  />
                ) : (
                  <Switch
                    id="edit-featured"
                    checked={currentGallery.featured}
                    onCheckedChange={(checked) => setCurrentGallery({ ...currentGallery, featured: checked })}
                  />
                )}
                <Label htmlFor={currentGallery.type === "private" ? "edit-download" : "edit-featured"}>
                  {currentGallery.type === "private"
                    ? "Enable downloads for this gallery"
                    : "Feature this gallery on the website"}
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGalleryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGallery}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Gallery Dialog */}
      <Dialog open={isViewGalleryOpen} onOpenChange={setIsViewGalleryOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gallery Details</DialogTitle>
          </DialogHeader>
          {currentGallery && (
            <div className="space-y-6">
              <div className="relative rounded-md overflow-hidden h-40 bg-muted">
                <img
                  src={currentGallery.coverImage}
                  alt={currentGallery.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 p-4 w-full">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <Badge variant={currentGallery.type === "public" ? "secondary" : "default"}>
                        {currentGallery.type === "public" ? "Public" : "Private"}
                      </Badge>
                      {currentGallery.featured && (
                        <Badge variant="outline" className="ml-2">Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-background/80">
                        <Image className="h-3.5 w-3.5 mr-1" /> {currentGallery.imageCount}
                      </Badge>
                      <Badge variant="outline" className="bg-background/80">
                        <Video className="h-3.5 w-3.5 mr-1" /> {currentGallery.videoCount}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">{currentGallery.title}</h3>
                <p className="text-sm text-muted-foreground">{currentGallery.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Session Date</p>
                    <p className="text-sm text-muted-foreground">{currentGallery.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Views</p>
                    <p className="text-sm text-muted-foreground">{currentGallery.views} views</p>
                  </div>
                </div>
                {currentGallery.type === "private" && (
                  <>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Client</p>
                        <p className="text-sm text-muted-foreground">
                          {currentGallery.client || "Not assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Downloads</p>
                        <p className="text-sm text-muted-foreground">
                          {currentGallery.downloadEnabled
                            ? `${currentGallery.downloads} downloads`
                            : "Downloads disabled"}
                        </p>
                      </div>
                    </div>
                    {currentGallery.expirationDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Expires</p>
                          <p className="text-sm text-muted-foreground">{currentGallery.expirationDate}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gallery Link</p>
                    <a href="#" className="text-sm text-primary hover:underline">
                      View in browser
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <h4 className="text-sm font-medium">Media Content</h4>
                  <Button variant="outline" size="sm">
                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Media
                  </Button>
                </div>
                {(currentGallery.imageCount > 0 || currentGallery.videoCount > 0) ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: Math.min(6, currentGallery.imageCount + currentGallery.videoCount) }).map((_, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-md"></div>
                    ))}
                    {currentGallery.imageCount + currentGallery.videoCount > 6 && (
                      <div className="col-span-3 text-center mt-2">
                        <Button variant="link" size="sm">View all media</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border rounded text-center">
                    <p className="text-sm text-muted-foreground">No media has been uploaded to this gallery yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewGalleryOpen(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={() => {
              setIsViewGalleryOpen(false);
              setIsEditGalleryOpen(true);
            }}>
              Edit Gallery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteGalleryOpen} onOpenChange={setIsDeleteGalleryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gallery</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentGallery?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteGalleryOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGallery}>
              Delete Gallery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Gallery Card Component
interface GalleryCardProps {
  gallery: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ gallery, onView, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img
          src={gallery.coverImage}
          alt={gallery.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant={gallery.type === "public" ? "secondary" : "default"}>
            {gallery.type === "public" ? "Public" : "Private"}
          </Badge>
          {gallery.featured && <Badge variant="outline">Featured</Badge>}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="outline" className="bg-background/80">
            <Image className="h-3.5 w-3.5 mr-1" /> {gallery.imageCount}
          </Badge>
          {gallery.videoCount > 0 && (
            <Badge variant="outline" className="bg-background/80">
              <Video className="h-3.5 w-3.5 mr-1" /> {gallery.videoCount}
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{gallery.title}</CardTitle>
        <CardDescription className="line-clamp-1">
          {gallery.category.charAt(0).toUpperCase() + gallery.category.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{gallery.createdAt}</span>
          </div>
          {gallery.client && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client:</span>
              <span>{gallery.client}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Views:</span>
            <span>{gallery.views}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GalleryManagement;
