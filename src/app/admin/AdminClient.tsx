
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ref as dbRef, onValue, get, set, remove, query, limitToLast, orderByChild, push, serverTimestamp, update } from 'firebase/database';
import Link from 'next/link';
import { ShieldCheck, User, Users, ChevronLeft, UserPlus, UserCog, Trash2, ShieldQuestion, Shield, GitCommit, Search, BookOpen, Activity, FolderKanban, Megaphone, Send, LogIn, Save, Wrench, BarChart, Settings, Mail, Eye, Flag, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// --- Interfaces ---
interface AppUser {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    teamCode?: string;
    lessonProgress?: Record<string, number>;
}

interface Team {
    id: string;
    name: string;
    roles?: { [role: string]: { [uid: string]: { name: string; email: string } } };
}

interface ActivityLog {
    id: string;
    type: string;
    userId: string;
    userName: string;
    details: any;
    timestamp: number;
}

type PopupType = 'login' | 'maintenance';

const allLessons = [...ftcJavaLessons, ...ftcJavaLessonsIntermediate, ...ftcJavaLessonsAdvanced];

const popupSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
  enabled: z.boolean().optional().default(true),
});

const featureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
});

const directMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

const ActivityIcon = ({ type }) => {
    switch (type) {
        case 'commit': case 'file': case 'snippet': case 'group': return <GitCommit className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
        case 'lesson_completion': return <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
        case 'analysis': return <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
        case 'admin_action': return <ShieldCheck className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
        default: return <Activity className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
    }
}

export default function AdminClient() {
  const { user, loading: authLoading, database } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Data states
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [adminActivities, setAdminActivities] = useState<ActivityLog[]>([]);
  const [featureFlags, setFeatureFlags] = useState<z.infer<typeof featureFlagSchema>[]>([]);
  
  // UI states
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPopupType, setSelectedPopupType] = useState<PopupType>('login');

  const announcementForm = useForm<z.infer<typeof popupSchema>>({ resolver: zodResolver(popupSchema), defaultValues: { title: "", message: "", enabled: true } });
  const persistentPopupForm = useForm<z.infer<typeof popupSchema>>({ resolver: zodResolver(popupSchema), defaultValues: { title: "", message: "", enabled: false } });
  const directMessageForm = useForm<z.infer<typeof directMessageSchema>>({ resolver: zodResolver(directMessageSchema) });

  const logAdminAction = async (action: string, details?: object) => {
      if (!database || !user) return;
      const adminActivitiesRef = dbRef(database, 'adminActivities');
      await push(adminActivitiesRef, {
          type: 'admin_action',
          userId: user.uid,
          userName: user.displayName || user.email,
          details: { action, ...details },
          timestamp: serverTimestamp(),
      });
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth'); return; }
    if (database) {
      const userRoleRef = dbRef(database, `users/${user.uid}/role`);
      get(userRoleRef).then((snapshot) => {
        if (snapshot.exists() && snapshot.val() === 'admin') { setIsAdmin(true); } else { setIsAdmin(false); router.push('/dashboard'); }
      });
    }
  }, [user, authLoading, router, database]);

  useEffect(() => {
    if (isAdmin && database) {
        setIsDataLoading(true);
        const refs = [
            { path: 'users', setter: setAllUsers, transform: (data) => Object.entries(data || {}).map(([id, val]: [string, any]) => ({ id, ...val })) },
            { path: 'teams', setter: setAllTeams, transform: (data) => Object.entries(data || {}).map(([id, val]: [string, any]) => ({ id, ...val })) },
            { path: 'activities', setter: setActivities, query: query(dbRef(database, 'activities'), orderByChild('timestamp'), limitToLast(10)), transform: (snap) => { const data: ActivityLog[] = []; snap.forEach(c => data.push({ id: c.key!, ...c.val() })); return data.reverse(); } },
            { path: 'adminActivities', setter: setAdminActivities, query: query(dbRef(database, 'adminActivities'), orderByChild('timestamp'), limitToLast(10)), transform: (snap) => { const data: ActivityLog[] = []; snap.forEach(c => data.push({ id: c.key!, ...c.val() })); return data.reverse(); } },
            { path: 'featureFlags', setter: setFeatureFlags, transform: (data) => Object.entries(data || {}).map(([id, val]: [string, any]) => ({ id, ...val })) },
        ];
        
        const unsubscribes = refs.map(r => onValue(r.query || dbRef(database, r.path), (snap) => r.setter(r.transform(r.query ? snap : snap.val()))));

        const popupsRef = dbRef(database, 'popups');
        const unsubscribePopups = onValue(popupsRef, (snapshot) => {
            const data = snapshot.val();
            persistentPopupForm.reset(data?.[selectedPopupType] || { title: "", message: "", enabled: false });
        });
        unsubscribes.push(unsubscribePopups);
        
        Promise.all(refs.map(r => get(r.query || dbRef(database, r.path)))).finally(() => setIsDataLoading(false));

        return () => unsubscribes.forEach(unsub => unsub());
    }
  }, [isAdmin, database, selectedPopupType]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    if (!database) return;
    const userRoleRef = dbRef(database, `users/${userId}/role`);
    await set(userRoleRef, newRole);
    toast({ title: 'Success', description: `User role has been updated to ${newRole}.` });
    await logAdminAction(`Set role to ${newRole}`, { targetUserId: userId });
  };

  const handleDeleteUser = async (userId: string) => {
    if (!database || !user) return;
    if (userId === user.uid) { toast({ title: 'Action Prohibited', description: "You can't delete your own account.", variant: 'destructive' }); return; }
    await remove(dbRef(database, `users/${userId}`));
    await remove(dbRef(database, `status/${userId}`));
    // Note: This does not remove the user from their team's member list. A more robust solution would do that.
    toast({ title: 'User Deleted', description: 'User removed from the database.' });
    await logAdminAction('Deleted user', { targetUserId: userId });
  };

  const handleSendAnnouncement = async (values: z.infer<typeof popupSchema>) => {
    if (!database || !user) return;
    await push(dbRef(database, 'announcements'), { ...values, timestamp: serverTimestamp(), sentBy: user.displayName || user.email });
    toast({ title: 'Announcement Sent!', description: 'Your update has been sent to all users.' });
    announcementForm.reset({ title: "", message: "", enabled: true });
    await logAdminAction('Sent announcement', { title: values.title });
  };

  const handleSetPersistentPopup = async (values: z.infer<typeof popupSchema>) => {
    if (!database || !user) return;
    await set(dbRef(database, `popups/${selectedPopupType}`), { ...values, updatedAt: serverTimestamp(), updatedBy: user.displayName || user.email });
    toast({ title: 'Pop-up Updated!', description: `The ${selectedPopupType} message has been set.` });
    await logAdminAction(`Updated ${selectedPopupType} pop-up`, { title: values.title, enabled: values.enabled });
  };

  const handleFeatureFlagChange = async (flagId: string, enabled: boolean) => {
    if (!database) return;
    const flagRef = dbRef(database, `featureFlags/${flagId}/enabled`);
    await set(flagRef, enabled);
    toast({ title: 'Feature Flag Updated', description: 'The flag state has been changed.' });
    await logAdminAction('Toggled feature flag', { flag: flagId, enabled });
  };
  
  const handleDeleteTeam = async (teamId: string) => {
    if (!database) return;
    // This is a simplified delete. A production version would need to handle associated data (chats, shares, etc.)
    await remove(dbRef(database, `teams/${teamId}`));
    toast({ title: 'Team Deleted', description: 'The team has been removed.'});
    setSelectedTeam(null);
    await logAdminAction('Deleted team', { teamId });
  };

  const handleSendDirectMessage = async (values: z.infer<typeof directMessageSchema>) => {
    if (!user || !database || !selectedUser) return;
    // This is a placeholder for a real DM system. It just sends an announcement for now.
    await push(dbRef(database, 'announcements'), {
        title: `Message from Admin: ${user.displayName}`,
        message: values.message,
        timestamp: serverTimestamp(),
        sentBy: user?.displayName || user?.email,
        recipient: selectedUser.id // This doesn't do anything yet but shows intent
    });
    toast({ title: "Message Sent", description: "Your message has been sent as a targeted announcement." });
    setSelectedUser(null);
    directMessageForm.reset();
  }

  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const filteredUsers = useMemo(() => {
    return userSearchTerm ? allUsers.filter(u => (u.name?.toLowerCase() || u.email?.toLowerCase() || '').includes(userSearchTerm.toLowerCase())) : allUsers;
  }, [allUsers, userSearchTerm]);
  const lessonsCompleted = allUsers.reduce((acc, user) => acc + Object.keys(user.lessonProgress || {}).length, 0);

  if (authLoading || isAdmin === null) return <div className="flex min-h-screen w-full items-center justify-center bg-background"><div className="loading-spinner"></div></div>;

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground"><ShieldCheck size={20} /></div><span className="text-xl font-headline font-bold">CodeSage</span></Link>
            <div className="flex items-center gap-2"><UserProfile /></div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <section className="mb-8"><Button variant="outline" asChild className="mb-6"><Link href="/dashboard"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link></Button><h1 className="font-headline text-4xl md:text-5xl font-bold">Admin Dashboard</h1><p className="text-foreground/80 mt-4 max-w-2xl text-lg">Application management and platform overview.</p></section>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{allUsers.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Administrators</CardTitle><Shield className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{adminCount}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Teams</CardTitle><FolderKanban className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{allTeams.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lessons Completed</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{lessonsCompleted}</div></CardContent></Card>
        </section>
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><Wrench /> Persistent Pop-up Manager</CardTitle><CardDescription>Configure pop-ups that stay active until disabled. Supports HTML.</CardDescription></CardHeader><Form {...persistentPopupForm}><form onSubmit={persistentPopupForm.handleSubmit(handleSetPersistentPopup)}><CardContent className="space-y-4"><Select onValueChange={(value: PopupType) => setSelectedPopupType(value)} defaultValue={selectedPopupType}><SelectTrigger><SelectValue placeholder="Select a pop-up type to manage" /></SelectTrigger><SelectContent><SelectItem value="login">Welcome on Login Pop-up</SelectItem><SelectItem value="maintenance">Maintenance Notice</SelectItem></SelectContent></Select><FormField control={persistentPopupForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Welcome back!" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={persistentPopupForm.control} name="message" render={({ field }) => (<FormItem><FormLabel>Message (HTML supported)</FormLabel><FormControl><Textarea placeholder="<h1>Update</h1><p>Here are some updates...</p>" {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} /><FormField control={persistentPopupForm.control} name="enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Enable this pop-up</FormLabel><FormMessage /></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/></CardContent><CardFooter><Button type="submit" disabled={persistentPopupForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" />{persistentPopupForm.formState.isSubmitting ? 'Saving...' : 'Set Pop-up'}</Button></CardFooter></form></Form></Card>
            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><Megaphone /> Send One-Time Announcement</CardTitle><CardDescription>Send a system-wide pop-up message to all users. This will appear once per user. HTML is supported.</CardDescription></CardHeader><Form {...announcementForm}><form onSubmit={announcementForm.handleSubmit(handleSendAnnouncement)}><CardContent className="space-y-4"><FormField control={announcementForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Scheduled Maintenance" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={announcementForm.control} name="message" render={({ field }) => (<FormItem><FormLabel>Message (HTML supported)</FormLabel><FormControl><Textarea placeholder="Enter the full announcement details here..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} /></CardContent><CardFooter><Button type="submit" disabled={announcementForm.formState.isSubmitting}><Send className="mr-2 h-4 w-4" />{announcementForm.formState.isSubmitting ? 'Sending...' : 'Send Update'}</Button></CardFooter></form></Form></Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-2 flex flex-col gap-8">
                 <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><UserCog /> User Management</CardTitle><CardDescription>A list of all registered users in the database.</CardDescription><div className="pt-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users by name or email..." className="pl-10" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} /></div></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isDataLoading ? ([...Array(5)].map((_, i) => (<TableRow key={i}><TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-[150px]" /></div></TableCell><TableCell><Skeleton className="h-4 w-[200px]" /></TableCell><TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell></TableRow>))) : (filteredUsers.map((appUser) => (<TableRow key={appUser.id}><TableCell><div className="flex items-center gap-3"><Avatar><AvatarImage data-ai-hint="person" src={`https://placehold.co/40x40.png`} /><AvatarFallback>{appUser.name ? appUser.name.substring(0, 2) : '?'}</AvatarFallback></Avatar><div><p className="font-medium">{appUser.name || 'N/A'}</p><p className="font-mono text-xs text-muted-foreground">{appUser.id}</p></div></div></TableCell><TableCell>{appUser.email || 'N/A'}</TableCell><TableCell>{appUser.role === 'admin' ? (<Badge variant="default" className="bg-primary/80">Admin</Badge>) : (<Badge variant="secondary">User</Badge>)}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => setSelectedUser(appUser)}><Eye className="h-4 w-4"/></Button>{appUser.role === 'admin' ? (<Button size="sm" variant="outline" onClick={() => handleRoleChange(appUser.id, 'user')} disabled={appUser.id === user?.uid}>Remove Admin</Button>) : (<Button size="sm" variant="outline" onClick={() => handleRoleChange(appUser.id, 'admin')}>Make Admin</Button>)}<AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={appUser.id === user?.uid}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the user and their associated data.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(appUser.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Yes, delete user</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></TableCell></TableRow>)))}</TableBody></Table></CardContent></Card>
                 <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><FolderKanban /> Team Management</CardTitle><CardDescription>A list of all created teams.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Team Name</TableHead><TableHead>Team ID</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isDataLoading ? ([...Array(3)].map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-4 w-[200px]" /></TableCell><TableCell><Skeleton className="h-4 w-[150px]" /></TableCell><TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell></TableRow>))) : (allTeams.map((team) => (<TableRow key={team.id}><TableCell className="font-medium">{team.name}</TableCell><TableCell className="font-mono text-xs">{team.id}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => setSelectedTeam(team)}><Eye className="h-4 w-4"/></Button></TableCell></TableRow>)))}</TableBody></Table></CardContent></Card>
                 <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><BookOpen /> Lesson Management</CardTitle><CardDescription>A read-only view of all lessons in the system.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Lesson Title</TableHead><TableHead>Course</TableHead><TableHead>Type</TableHead></TableRow></TableHeader><TableBody>{allLessons.map(lesson => (<TableRow key={lesson.id}><TableCell>{lesson.title}</TableCell><TableCell>{lesson.id.startsWith('adv') ? "Advanced" : lesson.id.startsWith('int') ? "Intermediate" : "Beginner"}</TableCell><TableCell><Badge variant="outline">{lesson.type}</Badge></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
            </div>
             <div className="xl:col-span-1 flex flex-col gap-8">
                <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><Flag /> Feature Flags</CardTitle><CardDescription>Toggle features on or off globally.</CardDescription></CardHeader><CardContent className="space-y-4">{isDataLoading ? <Skeleton className="h-20 w-full" /> : featureFlags.map(flag => (<div key={flag.id} className="flex items-center justify-between p-3 border rounded-lg"><Label htmlFor={`flag-${flag.id}`} className="font-medium">{flag.name}</Label><Switch id={`flag-${flag.id}`} checked={flag.enabled} onCheckedChange={(checked) => handleFeatureFlagChange(flag.id, checked)} /></div>))}</CardContent></Card>
                <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><Activity /> System Activity</CardTitle><CardDescription>The latest activities across the platform.</CardDescription></CardHeader><CardContent className="p-0"><ul className="divide-y divide-border/50">{isDataLoading ? ([...Array(5)].map((_, i) => (<li key={i} className="flex items-center gap-4 px-4 py-3"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-4 w-3/4" /></li>))) : activities.length > 0 ? (activities.map((activity) => (<li key={activity.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30"><ActivityIcon type={activity.type} /><div className="truncate"><p className="font-medium text-sm">{activity.userName}</p><p className="text-xs text-muted-foreground">{activity.type.replace('_', ' ')} - {formatDistanceToNowStrict(new Date(activity.timestamp), { addSuffix: true })}</p></div></li>))) : (<li className="p-4 text-center text-sm text-muted-foreground">No recent activity.</li>)}</ul></CardContent></Card>
                <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><ShieldCheck /> Admin Audit Trail</CardTitle><CardDescription>Latest actions performed by administrators.</CardDescription></CardHeader><CardContent className="p-0"><ul className="divide-y divide-border/50">{isDataLoading ? ([...Array(5)].map((_, i) => (<li key={i} className="flex items-center gap-4 px-4 py-3"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-4 w-3/4" /></li>))) : adminActivities.length > 0 ? (adminActivities.map((activity) => (<li key={activity.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30"><ActivityIcon type={activity.type} /><div className="truncate"><p className="font-medium text-sm">{activity.userName}</p><p className="text-xs text-muted-foreground">{activity.details.action} - {formatDistanceToNowStrict(new Date(activity.timestamp), { addSuffix: true })}</p></div></li>))) : (<li className="p-4 text-center text-sm text-muted-foreground">No admin actions recorded.</li>)}</ul></CardContent></Card>
                <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50"><CardHeader><CardTitle className="flex items-center gap-3"><Server /> System Status</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex justify-between items-center"><p>Firebase Database</p><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="text-green-400">Online</span></div></div><div className="flex justify-between items-center"><p>Resend Email API</p><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="text-green-400">Online</span></div></div></CardContent></Card>
            </div>
        </div>
      </main>

       <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>User Details: {selectedUser?.name}</DialogTitle>
                <DialogDescription>{selectedUser?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p><strong>Team:</strong> {allTeams.find(t => t.id === selectedUser?.teamCode)?.name || 'N/A'}</p>
                <p><strong>Lessons Passed:</strong> {Object.keys(selectedUser?.lessonProgress || {}).length}</p>
                <Form {...directMessageForm}>
                    <form onSubmit={directMessageForm.handleSubmit(handleSendDirectMessage)} className="space-y-2 pt-4 border-t">
                        <Label>Send Direct Message</Label>
                        <div className="flex gap-2">
                        <FormField control={directMessageForm.control} name="message" render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="Your message..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit"><Send className="h-4 w-4" /></Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DialogContent>
      </Dialog>

       <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Team Details: {selectedTeam?.name}</DialogTitle>
                <DialogDescription>ID: {selectedTeam?.id}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <h4 className="font-semibold mb-2">Members</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {selectedTeam?.roles && Object.entries(selectedTeam.roles).flatMap(([role, members]) => 
                        Object.entries(members).map(([uid, memberData]) => (
                            <div key={uid} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <div><p className="font-medium">{memberData.name}</p><p className="text-xs text-muted-foreground">{role}</p></div>
                                <p className="text-sm text-muted-foreground">{memberData.email}</p>
                            </div>
                        ))
                    ).length > 0 ? Object.entries(selectedTeam.roles).flatMap(([role, members]) => 
                        Object.entries(members).map(([uid, memberData]) => (
                            <div key={uid} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <div><p className="font-medium">{memberData.name}</p><p className="text-xs text-muted-foreground">{role}</p></div>
                                <p className="text-sm text-muted-foreground">{memberData.email}</p>
                            </div>
                        ))
                    ) : <p className="text-sm text-muted-foreground">No members found for this team.</p>}
                </div>
            </div>
            <div className="pt-4 border-t">
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive">Delete Team</Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Team '{selectedTeam?.name}'?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the team.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTeam(selectedTeam!.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Yes, delete team</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    