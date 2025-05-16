
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import AuthDialog from "./AuthDialog";
import { determineTier } from "@/utils/pointsUtils";
import { mockGalleries } from "@/utils/galleryUtils";

const UserMenu: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center">
        <AuthDialog 
          triggerElement={
            <Button variant="secondary" size="sm">Join Free</Button>
          }
          defaultTab="register"
        />
        <AuthDialog 
          triggerElement={
            <Button variant="ghost" size="sm" className="ml-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          }
          defaultTab="login"
        />
      </div>
    );
  }

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  const currentTier = determineTier(user.points);
  
  // Get gallery count for the badge
  const galleryCount = mockGalleries.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePic} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 capitalize">
              {currentTier} Tier
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/bookings" className="cursor-pointer">My Bookings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/gallery" className="cursor-pointer flex items-center justify-between">
            <span>My Gallery</span>
            <Badge variant="outline" className="ml-auto text-xs py-0">
              {galleryCount}
            </Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/points" className="cursor-pointer">
            <span>My Points</span>
            <span className="ml-auto bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5">
              {user.points}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard/gallery-settings" className="cursor-pointer">Gallery Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings" className="cursor-pointer">Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
