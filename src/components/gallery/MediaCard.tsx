
import React, { useState } from "react";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Download,
  Share,
  Star,
  MoreVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  MediaItem, 
  downloadFile,
  shareViaEmail
} from "@/utils/galleryUtils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import VisibilityToggle from "./VisibilityToggle";

interface MediaCardProps {
  item: MediaItem;
  onVisibilityChange?: (id: string, newVisibility: 'public' | 'private') => void;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ 
  item, 
  onVisibilityChange,
  onFavoriteToggle
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
  const handleDownload = () => {
    downloadFile(item);
  };
  
  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    
    setIsSharing(true);
    await shareViaEmail(shareEmail, item.title, item.id);
    setIsSharing(false);
    setShowShareDialog(false);
    setShareEmail("");
  };
  
  const handleFavoriteToggle = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(item.id, !item.isFavorite);
    }
  };
  
  const handleVisibilityChange = (newVisibility: 'public' | 'private') => {
    if (onVisibilityChange) {
      onVisibilityChange(item.id, newVisibility);
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden h-full">
        <div className="relative group">
          <AspectRatio ratio={1}>
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover cursor-pointer transition-all duration-200 group-hover:scale-105"
              onClick={() => setShowFullImage(true)}
            />
          </AspectRatio>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40"
                onClick={handleFavoriteToggle}
              >
                <Star className={`h-4 w-4 ${item.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40"
                onClick={() => setShowShareDialog(true)}
              >
                <Share className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>Download</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Badge 
            variant={item.visibility === "public" ? "default" : "outline"}
            className="absolute top-2 right-2 opacity-70"
          >
            {item.visibility === "public" ? "Public" : "Private"}
          </Badge>
        </div>
        <CardContent className="p-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium truncate">{item.title}</h4>
            <VisibilityToggle 
              visibility={item.visibility}
              onToggle={handleVisibilityChange}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{item.title}"</DialogTitle>
            <DialogDescription>
              Enter an email address to share this media.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Email address"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isSharing || !shareEmail.trim()}>
                {isSharing ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Full Image Dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl">
          <img 
            src={item.url} 
            alt={item.title} 
            className="w-full h-auto object-contain" 
          />
          <div className="flex justify-between items-center pt-2">
            <h3 className="font-medium">{item.title}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaCard;
