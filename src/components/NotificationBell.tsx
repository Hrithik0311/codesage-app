
'use client';

import React from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';


export function NotificationBell() {
  const { user, loading, notifications, markNotificationsAsRead } = useAuth();
  
  const hasUnread = notifications.length > 0;

  if (loading || !user) {
    return null; // Don't show notifications if not logged in
  }

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.preventDefault();
    markNotificationsAsRead();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/10"
          aria-label="Toggle notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-accent hover:text-accent/80"
              onClick={handleMarkAllRead}
              disabled={!hasUnread}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} asChild className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                        <Link href={notification.link}>
                            <div className="flex justify-between w-full">
                                <p className="font-semibold text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground">{notification.timestamp ? formatDistanceToNowStrict(new Date(notification.timestamp), { addSuffix: true }) : 'just now'}</p>
                            </div>
                            <p className="text-sm text-muted-foreground w-full truncate">{notification.description}</p>
                        </Link>
                    </DropdownMenuItem>
                ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                You have no new notifications.
              </div>
            )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center p-0">
          <Button asChild variant="link" className="w-full rounded-none text-accent hover:text-accent/80">
            <Link href="/notifications">View all</Link>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
