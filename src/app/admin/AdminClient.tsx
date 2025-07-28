
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ref as dbRef, onValue, get, set, remove, query, limitToLast, orderByChild } from 'firebase/database';
import Link from 'next/link';
import { ShieldCheck, User, Users, ChevronLeft, UserPlus, UserCog, Trash2, ShieldQuestion, Shield, GitCommit, Search, BookOpen, Activity, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile } from '@/components/UserProfile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';

interface AppUser {
    id: string;
    name?: string;
    email?: string;
    role?: string;
}

interface Team {
    id: string;
    name: string;
}

interface ActivityLog {
    id: string;
    type: string;
    userId: string;
    userName: string;
    details: any;
    timestamp: number;
}


const ActivityIcon = ({ type }) => {
    switch (type) {
        case 'commit':
        case 'file':
        case 'snippet':
        case 'group':
            return <GitCommit className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
        case 'lesson_completion':
            return <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
        case 'analysis':
            return <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
        default:
            return <Activity className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
    }
}


export default function AdminClient() {
  const { user, loading: authLoading, database } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
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
        const teamsRef = dbRef(database, 'teams');
        const activitiesRef = dbRef(database, 'activities');

        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val() || {};
            const loadedUsers: AppUser[] = Object.entries(usersData).map(([id, data]: [string, any]) => ({
                id, name: data.name, email: data.email, role: data.role,
            }));
            setAllUsers(loadedUsers);
        });

        const unsubscribeTeams = onValue(teamsRef, (snapshot) => {
            const teamsData = snapshot.val() || {};
            const loadedTeams: Team[] = Object.entries(teamsData).map(([id, data]: [string, any]) => ({
                id, name: data.name
            }));
            setAllTeams(loadedTeams);
        });

        const recentActivitiesQuery = query(activitiesRef, orderByChild('timestamp'), limitToLast(10));
        const unsubscribeActivities = onValue(recentActivitiesQuery, (snapshot) => {
            const activitiesData: ActivityLog[] = [];
            snapshot.forEach(child => {
                activitiesData.push({ id: child.key!, ...child.val() });
            });
            setActivities(activitiesData.reverse()); // Newest first
        });

        // Combine loading state logic
        Promise.all([get(usersRef), get(teamsRef), get(activitiesRef)]).finally(() => {
            setIsDataLoading(false);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeTeams();
            unsubscribeActivities();
        };
    }
  }, [isAdmin, database]);

  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
    if (!database) return;
    const userRoleRef = dbRef(database, `users/${userId}/role`);
    set(userRoleRef, newRole)
      .then(() => {
        toast({ title: 'Success', description: `User role has been updated to ${newRole}.` });
      })
      .catch((error) => {
        toast({ title: 'Error', description: `Could not update role: ${error.message}`, variant: 'destructive' });
      });
  };

  const handleDeleteUser = (userId: string) => {
    if (!database || !user) return;
    if (userId === user.uid) {
        toast({ title: 'Action Prohibited', description: "You cannot delete your own account from the admin panel.", variant: 'destructive' });
        return;
    }
    const userRef = dbRef(database, `users/${userId}`);
    remove(userRef)
      .then(() => {
        toast({ title: 'User Deleted', description: 'The user has been successfully removed from the database.' });
      })
      .catch((error) => {
        toast({ title: 'Error', description: `Could not delete user: ${error.message}`, variant: 'destructive' });
      });
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const adminCount = allUsers.filter(u => u.role === 'admin').length;

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
                Application management and platform overview.
            </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{allUsers.length}</div>
                    <p className="text-xs text-muted-foreground">all registered users</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{adminCount}</div>
                    <p className="text-xs text-muted-foreground">users with admin privileges</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{allTeams.length}</div>
                    <p className="text-xs text-muted-foreground">teams created on the platform</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Activities</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activities.length}</div>
                    <p className="text-xs text-muted-foreground">in the last hour (example)</p>
                </CardContent>
            </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
                <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><UserCog /> User Management</CardTitle>
                        <CardDescription>A list of all registered users in the database.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isDataLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-[150px]" /></div></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
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
                                                    <div>
                                                        <p className="font-medium">{appUser.name || 'N/A'}</p>
                                                        <p className="font-mono text-xs text-muted-foreground">{appUser.id}</p>
                                                    </div>
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
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {appUser.role === 'admin' ? (
                                                        <Button size="sm" variant="outline" onClick={() => handleRoleChange(appUser.id, 'user')} disabled={appUser.id === user?.uid}>
                                                            Remove Admin
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" onClick={() => handleRoleChange(appUser.id, 'admin')}>
                                                            Make Admin
                                                        </Button>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="destructive" disabled={appUser.id === user?.uid}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the user and their associated data from the database.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                  onClick={() => handleDeleteUser(appUser.id)}
                                                                  className={cn(buttonVariants({ variant: 'destructive' }))}
                                                                >
                                                                    Yes, delete user
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><FolderKanban /> Team Management</CardTitle>
                        <CardDescription>A list of all created teams.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Team ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isDataLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    allTeams.map((team) => (
                                        <TableRow key={team.id}>
                                            <TableCell className="font-medium">{team.name}</TableCell>
                                            <TableCell className="font-mono text-xs">{team.id}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <div className="lg:col-span-1">
                <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><Activity /> System Activity</CardTitle>
                        <CardDescription>The latest activities across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-border/50">
                            {isDataLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <li key={i} className="flex items-center gap-4 px-4 py-3"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-4 w-3/4" /></li>
                                ))
                            ) : activities.length > 0 ? (
                                activities.map((activity) => (
                                   <li key={activity.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                                       <ActivityIcon type={activity.type} />
                                       <div className="truncate">
                                           <p className="font-medium text-sm">{activity.userName}</p>
                                           <p className="text-xs text-muted-foreground">{activity.type.replace('_', ' ')} - {formatDistanceToNowStrict(new Date(activity.timestamp), { addSuffix: true })}</p>
                                       </div>
                                   </li>
                                ))
                            ) : (
                                <li className="p-4 text-center text-sm text-muted-foreground">No recent activity.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
