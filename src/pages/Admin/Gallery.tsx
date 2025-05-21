
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Upload, Users, FolderPlus } from "lucide-react";
import ClientGalleryManager from "@/components/admin/gallery/ClientGalleryManager";

const AdminGallery = () => {
  const [activeTab, setActiveTab] = useState("client-galleries");

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage client galleries and public image collections
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="client-galleries">
            <Users className="h-4 w-4 mr-2" />
            Client Galleries
          </TabsTrigger>
          <TabsTrigger value="public-collections">
            <Image className="h-4 w-4 mr-2" />
            Public Collections
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderPlus className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client-galleries">
          <ClientGalleryManager />
        </TabsContent>

        <TabsContent value="public-collections">
          <Card>
            <CardHeader>
              <CardTitle>Public Image Collections</CardTitle>
              <CardDescription>
                Manage public galleries for portfolio and marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Image className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Public Collections</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Create and manage public image collections for your website portfolio, 
                  social media, and marketing materials.
                </p>
                <Button>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Categories</CardTitle>
              <CardDescription>
                Organize your galleries with categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <FolderPlus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Manage Categories</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Create and manage categories to organize your galleries by type, 
                  event, or any other classification you need.
                </p>
                <Button>
                  Create Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGallery;
