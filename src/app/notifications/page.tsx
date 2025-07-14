
import type { Metadata } from 'next';
import { UserProfile } from '@/components/UserProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ShieldCheck, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications - CodeSage',
  description: 'View all your notifications.',
};

export default function NotificationsPage() {
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Bell /> All Updates</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-lg font-semibold text-muted-foreground">Notification system coming soon!</p>
                        <p className="text-muted-foreground">This page will show a full history of your notifications.</p>
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
