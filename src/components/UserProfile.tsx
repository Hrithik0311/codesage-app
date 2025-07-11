
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, LogOut, User, ClipboardCopy, Palette, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { ScrollArea } from './ui/scroll-area';
import { ThemeToggleButton } from './ThemeToggleButton';

const themes = [
    { name: "Dark", value: "dark" }, { name: "Light", value: "light" },
    { name: "Mono", value: "mono" }, { name: "Just Black", value: "just-black" },
    { name: "Slate", value: "slate" }, { name: "Oceanic", value: "oceanic" },
    { name: "Ultra Violet", value: "ultra-violet" }, { name: "Classic Blue", value: "classic-blue" },
    { name: "Banana", value: "banana" }, { name: "Black & White", value: "black-white" },
    { name: "Honeysuckle", value: "honeysuckle" }, { name: "Rose", value: "rose" },
    { name: "Serenity", value: "serenity" }, { name: "Sea Foam", value: "sea-foam" },
    { name: "Marsala", value: "marsala" }, { name: "High Contrast Colorful", value: "high-contrast-colorful" },
    { name: "Pretty in Pink", value: "pretty-in-pink" }, { name: "Morpheon Dark", value: "morpheon-dark" },
    { name: "Midnight monochrome", value: "midnight-monochrome" }, { name: "Slinky Elegant", value: "slinky-elegant" },
    { name: "Magic Forest Shrooms", value: "magic-forest-shrooms" }, { name: "Gruvbox Slate", value: "gruvbox-slate" },
    { name: "Aurora", value: "aurora" }, { name: "Pink Pixel Hearts", value: "pink-pixel-hearts" },
    { name: "Psychedelic Power", value: "psychedelic-power" }, { name: "Van Gogh Bouquet", value: "van-gogh-bouquet" },
    { name: "Black Carbon + Silver Metal", value: "black-carbon-silver-metal" }, { name: "Material Dark", value: "material-dark" },
    { name: "CosmicDust STD", value: "cosmic-dust-std" }, { name: "Purple Pink", value: "purple-pink" },
    { name: "Cardboard Day", value: "cardboard-day" }, { name: "Color Fusion", value: "color-fusion" },
    { name: "Mountain Lake", value: "mountain-lake" }, { name: "Catppuccin Macchiato", value: "catppuccin-macchiato" },
    { name: "Black", value: "black" }, { name: "Orange", value: "orange" },
    { name: "Pink", value: "pink" }, { name: "Blue", value: "blue" },
    { name: "Brown", value: "brown" }, { name: "Dark grey", value: "dark-grey" },
    { name: "Electric Blue", value: "electric-blue" }, { name: "Gray", value: "gray" },
    { name: "Green", value: "green" }, { name: "Light Lime", value: "light-lime" },
    { name: "Mint", value: "mint" }, { name: "Navy", value: "navy" },
    { name: "SlateGray", value: "slategray" }, { name: "LightSteelBlue", value: "lightsteelblue" },
    { name: "PowderBlue", value: "powderblue" }, { name: "Teal", value: "teal" },
    { name: "Aquamarine", value: "aquamarine" }, { name: "DarkTurquoise", value: "darkturquoise" },
    { name: "DarkSlateGray", value: "darkslategray" }, { name: "Olive", value: "olive" },
    { name: "DarkOliveGreen", value: "darkolivegreen" }, { name: "Yellow", value: "yellow" },
    { name: "Lime", value: "lime" }, { name: "Magenta", value: "magenta" },
    { name: "LightBlue", value: "lightblue" }, { name: "Lavender", value: "lavender" },
    { name: "AliceBlue", value: "aliceblue" }, { name: "GhostWhite", value: "ghostwhite" },
    { name: "Azure", value: "azure" }, { name: "LightCyan", value: "lightcyan" },
    { name: "Cyan/Aqua", value: "cyan-aqua" }, { name: "Turquoise", value: "turquoise" },
    { name: "MediumTurquoise", value: "mediumturquoise" }, { name: "LightSeaGreen", value: "lightseagreen" },
    { name: "CadetBlue", value: "cadetblue" }, { name: "DarkCyan", value: "darkcyan" },
    { name: "SeaGreen", value: "seagreen" }, { name: "MediumAquaMarine", value: "mediumaquamarine" },
    { name: "Mint Cream", value: "mint-cream" }, { name: "MediumSeaGreen", value: "mediumseagreen" },
];


export function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme } = useTheme();

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
    <div className="flex items-center gap-2">
      <ThemeToggleButton />
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
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Palette className="mr-2 h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <ScrollArea className="h-72 w-48">
                  {themes.map(theme => (
                    <DropdownMenuItem key={theme.value} onSelect={() => setTheme(theme.value)} className="cursor-pointer">
                      {theme.name}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

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
    </div>
  );
}
