'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, LogOut, User, ClipboardCopy } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Use window.location to force a full page reload.
      // This prevents a race condition where the homepage might
      // briefly see the logged-in user and redirect to the dashboard.
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
      toast({
        title: 'Logout Failed',
        description: 'An error occurred while logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUid = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent menu from closing
    if (!user) return;
    navigator.clipboard.writeText(user.uid);
    toast({
      title: 'Copied!',
      description: 'Your Member ID has been copied.',
    });
  };

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return (
      <Button asChild className="rounded-full">
        <Link href="/auth">Login / Sign Up</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            {user.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
            ) : (
              <User className="h-full w-full p-2 text-muted-foreground" />
            )}
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
            </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <DropdownMenuLabel className="font-normal !py-0 !px-2">
            <div className="flex flex-col space-y-1 py-1">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Member ID</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyUid}>
                        <ClipboardCopy className="h-3 w-3" />
                         <span className="sr-only">Copy Member ID</span>
                    </Button>
                </div>
                <p className="font-mono text-xs text-muted-foreground truncate">{user.uid}</p>
            </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
