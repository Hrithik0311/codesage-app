
'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShieldCheck, Bell, Check } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function NotificationItem({ notification }) {
    return (
        <Link href={notification.link} className="block hover:bg-muted/30 rounded-lg transition-colors">
            <div className="flex items-center justify-between gap-4 p-4 border-b">
                <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                        {notification.timestamp ? formatDistanceToNowStrict(new Date(notification.timestamp), { addSuffix: true }) : 'just now'}
                    </p>
                    {!notification.read && <div className="mt-1 w-2 h-2 rounded-full bg-primary ml-auto" />}
                </div>
            </div>
        </Link>
    );
}

export default function NotificationsPage() {
  const { user, loading, notifications, markNotificationsAsRead } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="loading-spinner"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col text-foreground">
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
          <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                      <ShieldCheck size={20} />
                  </div>
                  <span className="text-xl font-headline font-bold">CodeSage</span>
              </Link>
              <div className="flex items-center gap-2">
                  <UserProfile />
              </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <section className="mb-12 animate-fade-in-up-hero">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">
                    Notifications
                </h1>
                <p className="text-foreground/80 mt-4 max-w-2xl text-lg">
                    All your recent updates in one place.
                </p>
            </section>
            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-3"><Bell /> All Updates</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => markNotificationsAsRead()} disabled={!notifications.some(n => !n.read)}>
                        <Check className="mr-2 h-4 w-4"/>
                        Mark All as Read
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {notifications.length > 0 ? (
                        <div className="divide-y">
                           {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <p className="text-lg font-semibold text-muted-foreground">No notifications yet!</p>
                            <p className="text-muted-foreground">Team activity and other updates will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
