'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/UserProfile';

export default function DashboardClient() {
  const { user, loading } = useAuth();
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
    <div className="w-full flex flex-col items-center">
        <header className="w-full max-w-6xl mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                    <ShieldCheck size={20} />
                </div>
                <span className="text-xl font-headline font-bold">CodeSage</span>
            </Link>
            <UserProfile />
        </header>

        <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-md shadow-2xl border-border/50 mt-16">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                        {user.photoURL ? (
                            <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                        ) : (
                           <User className="h-full w-full p-3 text-muted-foreground" />
                        )}
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl font-headline">
                            {user.displayName || 'Welcome Back!'}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This is your personal dashboard. Explore the platform features below.</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href="/learning">Start Learning</Link>
                </Button>
                <Button asChild>
                    <Link href="/code-intelligence">Analyze Code</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
