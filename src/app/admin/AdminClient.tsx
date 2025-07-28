
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ref as dbRef, onValue, get } from 'firebase/database';
import Link from 'next/link';
import { ShieldCheck, User, Users, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile } from '@/components/UserProfile';

interface AppUser {
    id: string;
    name?: string;
    email?: string;
    role?: string;
}

export default function AdminClient() {
  const { user, loading: authLoading, database } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }
    if (database) {
      const userRoleRef = dbRef(database, `users/${user.uid}/role`);
      get(userRoleRef).then((snapshot) => {
        if (snapshot.exists() && snapshot.val() === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/dashboard');
        }
      });
    }
  }, [user, authLoading, router, database]);

  useEffect(() => {
    if (isAdmin && database) {
      setIsDataLoading(true);
      const usersRef = dbRef(database, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val() || {};
        const loadedUsers: AppUser[] = Object.entries(usersData).map(([id, data]: [string, any]) => ({
          id,
          name: data.name,
          email: data.email,
          role: data.role,
        }));
        setAllUsers(loadedUsers);
        setIsDataLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isAdmin, database]);

  if (authLoading || isAdmin === null) {
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
        <section className="mb-8">
            <Button variant="outline" asChild className="mb-6">
                <Link href="/dashboard"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
            </Button>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
                Admin Dashboard
            </h1>
            <p className="text-foreground/80 mt-4 max-w-2xl text-lg">
                Application management and user overview.
            </p>
        </section>

        <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><Users /> User Management</CardTitle>
                <CardDescription>A list of all registered users in the database.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>User ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isDataLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            allUsers.map((appUser) => (
                                <TableRow key={appUser.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage data-ai-hint="person" src={`https://placehold.co/40x40.png`} />
                                                <AvatarFallback>{appUser.name ? appUser.name.substring(0, 2) : '?'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{appUser.name || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{appUser.email || 'N/A'}</TableCell>
                                    <TableCell>
                                        {appUser.role === 'admin' ? (
                                            <Badge variant="default" className="bg-primary/80">Admin</Badge>
                                        ) : (
                                            <Badge variant="secondary">User</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{appUser.id}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
