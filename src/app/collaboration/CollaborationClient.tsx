
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { ShieldCheck, GitBranch, Rocket, Users, Settings, Code2, FolderKanban, PlusCircle, LogIn, Trash2, File, Eye, GripVertical, Plus, CalendarDays, Calendar as CalendarIcon, MessageSquare, SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { database } from '@/lib/firebase';
import { ref as dbRef, set, get, update, onValue, push, serverTimestamp, query, limitToLast, orderByChild, remove } from 'firebase/database';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { sendNotificationEmail } from '@/ai/flows/send-notification-email';

// --- Planner & Calendar Types ---
type Id = string;
type Column = { id: Id; title: string; };
type Task = { id: Id; columnId: Id; content: string; };
type CalendarEvent = { id:string; date: string; title: string; description: string; createdBy: string; creatorName: string };

const memberSchema = z.object({
    name: z.string().min(1, "Member name is required."),
    id: z.string().min(1, "Member ID is required."),
    role: z.string().min(1, "Role is required."),
    email: z.string().email("Please enter a valid email."),
    _isNew: z.boolean().optional(),
});

const createTeamSchema = z.object({
  teamName: z.string().min(3, "Team name must be at least 3 characters."),
  teamCode: z.string().min(4, "Team code must be at least 4 characters.").regex(/^[a-zA-Z0-9-]+$/, "Team code can only contain letters, numbers, and dashes."),
  pin: z.string().min(4, "PIN must be 4-6 digits.").max(6, "PIN must be 4-6 digit number.").regex(/^\d{4,6}$/, "PIN must be a 4-6 digit number."),
  members: z.array(memberSchema).min(1, "You must add at least one member."),
});

const joinTeamSchema = z.object({
  teamName: z.string().min(1, "Please enter the team name."),
  teamCode: z.string().min(1, "Please enter the team code."),
  pin: z.string().min(4, "PIN must be 4-6 digits.").max(6, "PIN must be 4-6 digits."),
});

const settingsSchema = z.object({
    teamName: z.string().min(3, "Team name must be at least 3 characters."),
    pin: z.string().min(4, "PIN must be 4-6 digit number.").max(6, "PIN must be 4-6 digit number."),
    members: z.array(memberSchema),
});

const eventSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
});


const StatusBadge = ({ status }: { status?: string }) => {
  const statusConfig: { [key: string]: { text: string; className: string } } = {
    online: { text: 'Online', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    idle: { text: 'Idle', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    offline: { text: 'Offline', className: 'bg-muted/30 text-muted-foreground border-border/50' },
  };

  const currentStatus = status && statusConfig[status] ? status : 'offline';
  const { text, className } = statusConfig[currentStatus];

  return (
    <Badge variant="outline" className={cn('transition-colors duration-300', className)}>
      {text}
    </Badge>
  );
};


// --- Collaboration Hub Main Component ---
export default function CollaborationClient() {
    const { toast } = useToast();
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [team, setTeam] = useState<any | null>(null);
    const [isLoadingTeam, setIsLoadingTeam] = useState(true);
    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
    const [isJoinTeamOpen, setIsJoinTeamOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [memberStatuses, setMemberStatuses] = useState<Record<string, { state: string }>>({});
    
    // --- Code Share State ---
    const [shares, setShares] = useState<any[]>([]);
    const [isLoadingShares, setIsLoadingShares] = useState(true);

    // --- Planner State ---
    const [columns, setColumns] = useState<Column[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingPlanner, setIsLoadingPlanner] = useState(true);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    
    // --- Calendar State ---
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isEventsLoading, setIsEventsLoading] = useState(true);
    const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
    
    // --- Chat State ---
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const chatContentRef = useRef<HTMLDivElement>(null);


    const formatTimestamp = (timestamp: number | undefined): string => {
        if (!timestamp) return '';
        return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
    };

    // --- Forms ---
    const createForm = useForm<z.infer<typeof createTeamSchema>>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: { teamName: "", teamCode: "", pin: "", members: [] },
    });
    const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({ control: createForm.control, name: "members" });
    
    const joinForm = useForm<z.infer<typeof joinTeamSchema>>({
        resolver: zodResolver(joinTeamSchema),
        defaultValues: { teamName: "", teamCode: "", pin: "" },
    });
    
    const settingsForm = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: { teamName: "", pin: "", members: [] },
    });
    const { fields: settingsMemberFields, append: appendSettingsMember, remove: removeSettingsMember } = useFieldArray({ control: settingsForm.control, name: "members" });
    const watchedMembers = settingsForm.watch("members");

    const eventForm = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: { title: "", description: "" },
    });

    // --- Effects ---
    useEffect(() => {
        if(isCreateTeamOpen && user && memberFields.length === 0) {
            appendMember({ name: user.displayName || '', id: user.uid, role: 'Captain', email: user.email || '' });
        }
    }, [isCreateTeamOpen, user, memberFields, appendMember]);

    useEffect(() => {
      let teamDataUnsubscribe: () => void = () => {};
      let isMounted = true;
      if (loading || !user || !database) {
          if (!loading) setIsLoadingTeam(false);
          return;
      }
      setIsLoadingTeam(true);
      const userTeamRef = dbRef(database, `users/${user.uid}/teamCode`);
      get(userTeamRef).then((snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
              const teamCode = snapshot.val();
              const teamDataRef = dbRef(database, `teams/${teamCode}`);
              teamDataUnsubscribe = onValue(teamDataRef, (teamSnapshot) => {
                  if (!isMounted) return;
                  if (teamSnapshot.exists()) {
                    setTeam({ id: teamCode, ...teamSnapshot.val() });
                    if (searchParams.get('action') === 'settings') {
                        setIsSettingsOpen(true);
                    }
                  } else {
                    setTeam(null);
                  }
                  setIsLoadingTeam(false);
              }, (error) => {
                  console.error("Error fetching team data:", error);
                  toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your team information.' });
                  setIsLoadingTeam(false);
              });
          } else {
              setTeam(null);
              setIsLoadingTeam(false);
          }
      }).catch(error => {
          console.error("Error fetching user team data:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your team information.' });
          setIsLoadingTeam(false);
      });
      return () => { isMounted = false; teamDataUnsubscribe(); };
    }, [user, loading, router, database, toast, searchParams]);

    useEffect(() => {
        if (team && isSettingsOpen) {
            const membersForForm: any[] = [];
            for (const role in team.roles) {
                for (const id in team.roles[role]) {
                    membersForForm.push({ id, name: team.roles[role][id].name, email: team.roles[role][id].email, role, _isNew: false });
                }
            }
            settingsForm.reset({ teamName: team.name, pin: team.pin, members: membersForForm });
        }
    }, [team, isSettingsOpen, settingsForm]);

    useEffect(() => {
        if (!team || !database) return;
        const allMemberIds = Object.values(team.roles || {}).flatMap((roleMembers: any) => Object.keys(roleMembers));
        if (allMemberIds.length === 0) return;
        const statusRef = dbRef(database, 'status');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const allStatuses = snapshot.val() || {};
            const teamStatuses: Record<string, { state: string }> = {};
            allMemberIds.forEach(id => { if (allStatuses[id]) teamStatuses[id] = allStatuses[id]; });
            setMemberStatuses(teamStatuses);
        });
        return () => unsubscribe();
    }, [team, database]);
    
    useEffect(() => {
        if (!team || !database) return;
        setIsLoadingShares(true);
        const sharesRef = dbRef(database, `teams/${team.id}/shares`);
        const sharesQuery = query(sharesRef, orderByChild('timestamp'), limitToLast(15));
        const unsubscribe = onValue(sharesQuery, (snapshot) => {
            const sharesData: any[] = [];
            snapshot.forEach((child) => { sharesData.push({ id: child.key, ...child.val() }); });
            setShares(sharesData.map(share => ({ ...share, id: share.id, time: share.timestamp ? formatDistanceToNowStrict(new Date(share.timestamp), { addSuffix: true }) : 'just now' })).reverse());
            setIsLoadingShares(false);
        });
        return () => unsubscribe();
    }, [team, database]);

    useEffect(() => {
        if (!team || !database) { setIsLoadingPlanner(true); return; };
        const plannerRef = dbRef(database, `teams/${team.id}/planner`);
        const initializePlanner = () => {
            const defaultColumns = [ { id: 'col-1', title: 'To Do' }, { id: 'col-2', title: 'In Progress' }, { id: 'col-3', title: 'Done' } ];
            const updates: { [key: string]: any } = {};
            defaultColumns.forEach(col => { updates[`/teams/${team.id}/planner/columns/${col.id}`] = col; });
            update(dbRef(database), updates);
        };
        const unsubscribe = onValue(plannerRef, (snapshot) => {
            if (!snapshot.exists()) { initializePlanner(); setIsLoadingPlanner(false); return; }
            const plannerData = snapshot.val();
            setColumns(plannerData.columns ? Object.values(plannerData.columns) : []);
            setTasks(plannerData.tasks ? Object.values(plannerData.tasks) : []);
            setIsLoadingPlanner(false);
        });
        return () => unsubscribe();
    }, [team, database]);

    useEffect(() => {
        if (!team || !database) { setIsEventsLoading(true); return; };
        const eventsRef = dbRef(database, `teams/${team.id}/calendarEvents`);
        const unsubscribe = onValue(eventsRef, (snapshot) => {
            const eventsData: CalendarEvent[] = [];
            snapshot.forEach((child) => {
                eventsData.push({ id: child.key!, ...child.val() });
            });
            setEvents(eventsData);
            setIsEventsLoading(false);
        });
        return () => unsubscribe();
    }, [team, database]);
    
    useEffect(() => {
        if (!team || !database || !team.announcementsChatId) {
            setIsLoadingMessages(false);
            return;
        };
        
        setIsLoadingMessages(true);
        const announcementsRef = dbRef(database, `chats/${team.announcementsChatId}/messages`);
        const announcementsQuery = query(announcementsRef, orderByChild('timestamp'), limitToLast(50));
    
        const unsubscribe = onValue(announcementsQuery, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((child) => {
                data.push({ id: child.key, ...child.val() });
            });
            setMessages(data);
            setIsLoadingMessages(false);
        });
    
        return () => unsubscribe();
    
    }, [team, database]);
    
    useEffect(() => {
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [messages]);


    // --- Team Management Functions ---
    const handleCreateTeam = async (values: z.infer<typeof createTeamSchema>) => {
        if (!user || !database) return;
        const teamRef = dbRef(database, 'teams/' + values.teamCode);
        const snapshot = await get(teamRef);
        if (snapshot.exists()) { createForm.setError("teamCode", { type: "manual", message: "This team code is already taken." }); return; }
        const rolesData: { [key: string]: { [uid: string]: {name: string, email: string} } } = {};
        values.members.forEach(member => {
            if (!rolesData[member.role]) rolesData[member.role] = {};
            rolesData[member.role][member.id] = { name: member.name, email: member.email };
        });
        const announcementsChatRef = push(dbRef(database, 'chats'));
        const announcementsChatId = announcementsChatRef.key;
        if (!announcementsChatId) { toast({ variant: 'destructive', title: 'Error', description: 'Could not create team channel.' }); return; }
        await set(announcementsChatRef, { metadata: { name: `${values.teamName} Announcements`, type: 'channel', teamId: values.teamCode, } });
        const newTeam = { name: values.teamName, roles: rolesData, pin: values.pin, creatorUid: user.uid, announcementsChatId: announcementsChatId, };
        await set(teamRef, newTeam);
        const userUpdates: { [key: string]: any } = {};
        values.members.forEach(member => {
            userUpdates[`/users/${member.id}/teamCode`] = values.teamCode;
            userUpdates[`/users/${member.id}/chats/${announcementsChatId}`] = true;
            userUpdates[`/users/${member.id}/name`] = member.name;
            userUpdates[`/users/${member.id}/email`] = member.email;
        });
        await update(dbRef(database), userUpdates);
        setTeam({ id: values.teamCode, ...newTeam });
        setIsCreateTeamOpen(false);

        // Send welcome emails
        for (const member of values.members) {
            if (member.email) {
                sendNotificationEmail({
                    to: member.email,
                    subject: `Welcome to the team: ${values.teamName}!`,
                    body: `<h1>Welcome!</h1><p>You have been added to the team '${values.teamName}' on CodeSage. You can log in and start collaborating now.</p>`
                }).then(res => toast({ title: 'Notification Sent!', description: res.status }))
                  .catch(e => console.error("Failed to send welcome email:", e));
            }
        }

        createForm.reset();
        toast({ title: 'Success!', description: 'Your team has been created.' });
    };

    const handleJoinTeam = async (values: z.infer<typeof joinTeamSchema>) => {
        if (!user || !database) return;
        const teamRef = dbRef(database, 'teams/' + values.teamCode);
        const snapshot = await get(teamRef);
        if (!snapshot.exists()) { joinForm.setError("teamCode", { type: "manual", message: "This team code does not exist." }); return; }
        const teamData = snapshot.val();
        if (teamData.name.toLowerCase() !== values.teamName.toLowerCase()) { joinForm.setError("teamName", { type: "manual", message: "Team name does not match the team code." }); return; }
        if (teamData.pin !== values.pin) { joinForm.setError("pin", { type: "manual", message: "The PIN for this team is incorrect." }); return; }
        const newMemberId = user.uid;
        const isAlreadyMember = Object.values(teamData.roles || {}).some(roleMembers => newMemberId in (roleMembers as object));
        const memberName = user.displayName || 'New Member';
        const memberEmail = user.email || '';

        const updates: { [key: string]: any } = {};
        if (isAlreadyMember) { toast({ title: "Already a member", description: "You are already a member of this team." });
        } else { updates[`teams/${values.teamCode}/roles/Member/${newMemberId}`] = {name: memberName, email: memberEmail}; }
        
        updates[`/users/${user.uid}/name`] = memberName;
        updates[`/users/${user.uid}/email`] = memberEmail;
        updates[`/users/${user.uid}/teamCode`] = values.teamCode;
        if (teamData.announcementsChatId) { updates[`/users/${user.uid}/chats/${teamData.announcementsChatId}`] = true; }
        await update(dbRef(database), updates);
        setIsJoinTeamOpen(false);
        joinForm.reset();
        toast({ title: 'Success!', description: `You have joined the team: ${teamData.name}` });

        // Notify team creator
        if (!isAlreadyMember && teamData.creatorUid) {
            const creatorRef = dbRef(database, `users/${teamData.creatorUid}/email`);
            const creatorSnapshot = await get(creatorRef);
            if (creatorSnapshot.exists()) {
                const creatorEmail = creatorSnapshot.val();
                sendNotificationEmail({
                    to: creatorEmail,
                    subject: `New Member: ${memberName} joined your team!`,
                    body: `<h1>New Team Member</h1><p>${memberName} has just joined your team, '${teamData.name}'.</p>`
                }).then(res => toast({ title: 'Notification Sent!', description: res.status }))
                  .catch(e => console.error("Failed to send notification email to creator:", e));
            }
        }
    };
    
    const handleUpdateTeamSettings = async (values: z.infer<typeof settingsSchema>) => {
        if (!user || !database || !team) return;
        const updates: { [key: string]: any } = {};
        const allMemberEmails: string[] = [];
        
        if (user.uid === team.creatorUid) {
            const originalMemberIds = new Set(Object.values(team.roles || {}).flatMap((roleMembers: any) => Object.keys(roleMembers)));
            const newMemberIds = new Set(values.members.map(m => m.id));
            const newRoles: { [key: string]: { [uid: string]: {name: string, email: string} } } = {};
            
            values.members.forEach(member => {
                if (!member.id) return;
                if (!newRoles[member.role]) newRoles[member.role] = {};
                newRoles[member.role][member.id] = {name: member.name, email: member.email};
                updates[`/users/${member.id}/name`] = member.name;
                updates[`/users/${member.id}/email`] = member.email;
                if (!originalMemberIds.has(member.id) && member._isNew) {
                    updates[`/users/${member.id}/teamCode`] = team.id;
                    if (team.announcementsChatId) updates[`/users/${member.id}/chats/${team.announcementsChatId}`] = true;
                }
                if (member.email) allMemberEmails.push(member.email);
            });
            
            originalMemberIds.forEach(id => {
                if (!newMemberIds.has(id)) {
                    updates[`/users/${id}/teamCode`] = null;
                    if (team.announcementsChatId) updates[`/users/${id}/chats/${team.announcementsChatId}`] = null;
                }
            });

            updates[`/teams/${team.id}/name`] = values.teamName;
            updates[`/teams/${team.id}/pin`] = values.pin;
            updates[`/teams/${team.id}/roles`] = newRoles;
        } else { 
            toast({ variant: 'destructive', title: 'Error', description: 'Only the team creator can modify team settings.' }); 
            return; 
        }

        try {
            await update(dbRef(database), updates);
            toast({ title: 'Success!', description: 'Team settings have been updated.' });
            setIsSettingsOpen(false);

            // Notify all current team members
            for (const email of allMemberEmails) {
                sendNotificationEmail({
                    to: email,
                    subject: `Team Update: ${values.teamName}`,
                    body: `<h1>Team Settings Updated</h1><p>The settings for your team, '${values.teamName}', have been updated by the team captain. You can view the changes in the Collaboration Hub.</p>`
                }).then(res => toast({ title: 'Notification Sent!', description: res.status }))
                  .catch(e => console.error(`Failed to send settings update to ${email}:`, e));
            }

        } catch (error) {
            console.error("Error updating team settings:", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save team settings.' });
        }
    };

    // --- Chat Functions ---
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !team || !team.announcementsChatId || isSending) return;
        
        setIsSending(true);
        const textToSend = newMessage;
        setNewMessage("");

        const messageData = {
            text: textToSend,
            senderId: user.uid,
            senderName: user.displayName || user.email,
            timestamp: serverTimestamp()
        };

        const messageRef = dbRef(database, `chats/${team.announcementsChatId}/messages`);
        const lastMessageRef = dbRef(database, `chats/${team.announcementsChatId}/metadata/lastMessage`);

        try {
            await push(messageRef, messageData);
            await set(lastMessageRef, { text: textToSend, timestamp: serverTimestamp() });
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: 'destructive', title: 'Error', description: "Could not send message." });
            setNewMessage(textToSend); // put message back in box on error
        } finally {
            setIsSending(false);
        }
    }


    // --- Planner Functions ---
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));
    function createTask(columnId: Id) {
        if (!team) return;
        const newTask: Task = { id: uuidv4(), columnId, content: `Task ${tasks.length + 1}` };
        set(dbRef(database, `teams/${team.id}/planner/tasks/${newTask.id}`), newTask);
    }
    function createNewColumn() {
        if (!team) return;
        const columnToAdd: Column = { id: uuidv4(), title: `Column ${columns.length + 1}` };
        set(dbRef(database, `teams/${team.id}/planner/columns/${columnToAdd.id}`), columnToAdd);
    }
    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'Task') { setActiveTask(event.active.data.current.task); return; }
    }
    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);
        const { active, over } = event;
        if (!over || active.id === over.id || !team) return;
        const activeTask = tasks.find(t => t.id === active.id);
        if (activeTask && activeTask.columnId !== over.id) {
            set(dbRef(database, `teams/${team.id}/planner/tasks/${active.id}/columnId`), over.id);
        }
    }

    // --- Calendar Functions ---
    const eventsForSelectedDay = useMemo(() => {
        if (!date) return [];
        const selectedDateStr = format(date, 'yyyy-MM-dd');
        return events.filter(event => event.date === selectedDateStr);
    }, [date, events]);

    const eventDates = useMemo(() => new Set(events.map(e => e.date)), [events]);
    const calendarModifiers = useMemo(() => ({
        hasEvent: (day: Date) => eventDates.has(format(day, 'yyyy-MM-dd')),
    }), [eventDates]);
    const calendarModifierStyles = { hasEvent: { 'position': 'relative', 'overflow': 'visible' } };

    const handleAddEvent = async (values: z.infer<typeof eventSchema>) => {
        if (!user || !database || !team || !date) return;
        const newEventRef = push(dbRef(database, `teams/${team.id}/calendarEvents`));
        const newEvent = {
            date: format(date, 'yyyy-MM-dd'),
            title: values.title,
            description: values.description || "",
            createdBy: user.uid,
            creatorName: user.displayName || user.email,
        };
        await set(newEventRef, newEvent);
        toast({ title: "Event Added!" });
        setIsAddEventDialogOpen(false);
        eventForm.reset();

        // Notify all team members
        const allMemberEmails: string[] = Object.values(team.roles)
            .flatMap((roleMembers: any) => Object.values(roleMembers).map((member: any) => member.email))
            .filter(Boolean); // Filter out any null/undefined emails
        
        for (const email of allMemberEmails) {
            sendNotificationEmail({
                to: email,
                subject: `New Team Event: ${newEvent.title}`,
                body: `<h1>New Event Added to ${team.name}'s Calendar</h1>
                       <p>A new event has been added:</p>
                       <p><b>Title:</b> ${newEvent.title}</p>
                       <p><b>Date:</b> ${format(date, 'PPP')}</p>
                       <p><b>Description:</b> ${newEvent.description || 'N/A'}</p>`
            }).then(res => toast({ title: 'Notification Sent!', description: res.status }))
              .catch(e => console.error(`Failed to send event notification to ${email}:`, e));
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!database || !team) return;
        const eventRef = dbRef(database, `teams/${team.id}/calendarEvents/${eventId}`);
        await remove(eventRef);
        toast({ title: "Event Deleted" });
    }


    if (loading || isLoadingTeam) {
        return <div className="flex min-h-screen w-full items-center justify-center bg-background"><div className="loading-spinner"></div></div>;
    }

    if (!team) {
        return (
            <>
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
                <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground"><ShieldCheck size={20} /></div>
                        <span className="text-xl font-headline font-bold">CodeSage</span>
                    </Link>
                    <div className="flex items-center gap-2"><ThemeToggleButton /><UserProfile /></div>
                </div>
            </header>
            <div className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                    <CardHeader className="text-center"><CardTitle className="font-headline text-3xl">Collaboration Hub</CardTitle><CardDescription className="text-lg">Create a new team or join an existing one to start collaborating.</CardDescription></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                            <DialogTrigger asChild><Button variant="outline" className="py-8 text-lg"><PlusCircle className="mr-2 h-5 w-5" />Create a Team</Button></DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader><DialogTitle>Create a New Team</DialogTitle><DialogDescription>Fill out the details below to get your team started.</DialogDescription></DialogHeader>
                                <Form {...createForm}>
                                    <form onSubmit={createForm.handleSubmit(handleCreateTeam)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                        <FormField control={createForm.control} name="teamName" render={({ field }) => (<FormItem><FormLabel>Team Name</FormLabel><FormControl><Input placeholder="e.g., The Robo-Wizards" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={createForm.control} name="teamCode" render={({ field }) => (<FormItem><FormLabel>Team Code</FormLabel><FormControl><Input placeholder="Create a unique code for your team" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={createForm.control} name="pin" render={({ field }) => (<FormItem><FormLabel>4-6 Digit PIN</FormLabel><FormControl><Input type="password" placeholder="e.g., 123456" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                        <div>
                                            <FormLabel>Team Members</FormLabel>
                                            <div className="space-y-3 mt-2">
                                                {memberFields.map((field, index) => (
                                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr_auto] items-end gap-2 p-3 border rounded-md">
                                                        <FormField control={createForm.control} name={`members.${index}.name`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Member Name</FormLabel><FormControl><Input placeholder="e.g., Alex Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={createForm.control} name={`members.${index}.email`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Email</FormLabel><FormControl><Input placeholder="alex@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={createForm.control} name={`members.${index}.role`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Role</FormLabel><FormControl><Input placeholder="e.g., Programmer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={createForm.control} name={`members.${index}.id`} render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeMember(index)} disabled={memberFields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendMember({ name: "", id: uuidv4(), email: "", role: "Member" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
                                        </div>
                                        <DialogFooter className="pt-4 sticky bottom-0 bg-background/90 py-3 -mx-4 px-4"><Button type="submit" disabled={createForm.formState.isSubmitting}>{createForm.formState.isSubmitting ? 'Creating...' : 'Create Team'}</Button></DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isJoinTeamOpen} onOpenChange={setIsJoinTeamOpen}>
                            <DialogTrigger asChild><Button className="py-8 text-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"><LogIn className="mr-2 h-5 w-5" />Join a Team</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Join an Existing Team</DialogTitle><DialogDescription>Enter the team's details to request access.</DialogDescription></DialogHeader>
                                <Form {...joinForm}>
                                    <form onSubmit={joinForm.handleSubmit(handleJoinTeam)} className="space-y-4 py-4">
                                        <FormField control={joinForm.control} name="teamName" render={({ field }) => (<FormItem><FormLabel>Team Name</FormLabel><FormControl><Input placeholder="Enter the team's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={joinForm.control} name="teamCode" render={({ field }) => (<FormItem><FormLabel>Team Code</FormLabel><FormControl><Input placeholder="Enter the team's unique code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={joinForm.control} name="pin" render={({ field }) => (<FormItem><FormLabel>Team PIN</FormLabel><FormControl><Input type="password" placeholder="Enter the team's PIN" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <DialogFooter><Button type="submit" disabled={joinForm.formState.isSubmitting}>{joinForm.formState.isSubmitting ? 'Joining...' : 'Join Team'}</Button></DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
            </>
        )
    }

    return (
        <>
            <div className="min-h-screen flex flex-col text-foreground">
                <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
                    <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"><div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground"><ShieldCheck size={20} /></div><span className="text-xl font-headline font-bold">CodeSage</span></Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2"><h1 className="hidden md:block text-xl md:text-2xl font-bold font-headline">{team.name} Hub</h1></div>
                             <div className="flex items-center gap-2"><ThemeToggleButton /><UserProfile /></div>
                        </div>
                    </div>
                </header>
                <div className="flex-grow container mx-auto p-4 md:p-8 relative">
                    <section className="text-center mb-12 animate-fade-in-up-hero">
                        <h2 className="font-headline text-4xl md:text-5xl font-bold gradient-text hero-title-gradient">Build Together, Win Together</h2>
                        <p className="text-foreground/80 mt-4 max-w-3xl mx-auto text-lg">Real-time code sharing, version control, and deployment pipelines, all in one place.</p>
                    </section>
                    {user?.uid === team.creatorUid && (
                        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DialogTrigger asChild><Button variant="outline" size="icon" className="absolute top-4 right-4 md:top-8 md:right-8 z-10"><Settings className="h-5 w-5" /><span className="sr-only">Team Settings</span></Button></DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader><DialogTitle>Team Settings</DialogTitle><DialogDescription>Manage your team's information and members.</DialogDescription></DialogHeader>
                                <Form {...settingsForm}>
                                    <form onSubmit={settingsForm.handleSubmit(handleUpdateTeamSettings)}>
                                        <Tabs defaultValue="general" className="mt-4">
                                            <TabsList><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="members">Members</TabsTrigger></TabsList>
                                            <TabsContent value="general" className="space-y-6 py-6">
                                                <FormField control={settingsForm.control} name="teamName" render={({ field }) => (<FormItem><FormLabel>Team Name</FormLabel><FormControl><Input placeholder="e.g., The Robo-Wizards" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={settingsForm.control} name="pin" render={({ field }) => (<FormItem><FormLabel>4-6 Digit PIN</FormLabel><FormControl><Input type="password" placeholder="e.g., 123456" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </TabsContent>
                                            <TabsContent value="members" className="py-6 max-h-[50vh] overflow-y-auto">
                                                <div className="space-y-4">
                                                    {settingsMemberFields.map((field, index) => {
                                                        const isNewMember = !!watchedMembers[index]?._isNew;
                                                        return (
                                                        <div key={field.id} className="flex items-end gap-3 p-3 border rounded-md">
                                                            <FormField control={settingsForm.control} name={`members.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="text-xs">Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={settingsForm.control} name={`members.${index}.email`} render={({ field }) => (<FormItem className="flex-grow-[1.5]"><FormLabel className="text-xs">Email</FormLabel><FormControl><Input {...field} readOnly={!isNewMember} placeholder={isNewMember ? "new.member@example.com" : ""} /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={settingsForm.control} name={`members.${index}.role`} render={({ field }) => (<FormItem className="w-[150px]"><FormLabel className="text-xs">Role</FormLabel><FormControl><Input placeholder="e.g., Programmer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeSettingsMember(index)} disabled={field.id === team.creatorUid}><Trash2 className="h-4 w-4" /></Button>
                                                        </div>
                                                    )})}
                                                </div>
                                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSettingsMember({ name: "", id: uuidv4(), email: "", role: "Member", _isNew: true })}><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
                                            </TabsContent>
                                        </Tabs>
                                        <DialogFooter className="mt-6"><Button type="submit" disabled={settingsForm.formState.isSubmitting}>{settingsForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</Button></DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 flex flex-col gap-8">
                             <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 flex-grow flex flex-col">
                                <CardHeader><CardTitle className="flex items-center gap-3"><MessageSquare /> Team Chat</CardTitle><CardDescription>Your team's main communication channel.</CardDescription></CardHeader>
                                <CardContent className="flex-grow p-0 flex flex-col">
                                    <ScrollArea className="flex-grow h-96">
                                        <div ref={chatContentRef} className="p-4 space-y-4">
                                            {isLoadingMessages ? (
                                                <div className="flex justify-center items-center h-full"><Skeleton className="h-24 w-full" /></div>
                                            ) : messages.length > 0 ? (
                                                messages.map(msg => (
                                                    <div key={msg.id} className="flex items-start gap-3">
                                                        <Avatar className="h-8 w-8 border"><AvatarImage data-ai-hint="person" src={`https://placehold.co/40x40.png`} /><AvatarFallback>{msg.senderName.substring(0,1)}</AvatarFallback></Avatar>
                                                        <div>
                                                            <div className="flex items-baseline gap-2">
                                                                <p className="font-bold text-sm">{msg.senderName}</p>
                                                                <p className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</p>
                                                            </div>
                                                            <div className="bg-muted/50 p-3 rounded-lg mt-1"><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-muted-foreground">No messages yet. Start the conversation!</div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter className="border-t pt-4">
                                    <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                                        <Input
                                            placeholder={user?.uid === team.creatorUid ? "Send a message to the team..." : "Only the team captain can post here."}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            disabled={isSending || user?.uid !== team.creatorUid}
                                        />
                                        <Button type="submit" size="icon" disabled={isSending || !newMessage.trim() || user?.uid !== team.creatorUid}>
                                            <SendHorizontal className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 flex flex-col gap-8">
                            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                                <CardHeader><CardTitle className="flex items-center gap-2"><Users /> Team Members</CardTitle><CardDescription>Your current team workspace.</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {team.roles && Object.entries(team.roles).map(([roleName, members]: [string, { [uid: string]: {name: string, email: string} }]) => (
                                            <div key={roleName}>
                                                <h4 className="font-semibold text-muted-foreground mb-3 px-1">{roleName}</h4>
                                                <div className="space-y-4">
                                                    {Object.entries(members).length > 0 ? Object.entries(members).map(([memberId, memberData]) => (
                                                        <div key={memberId} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar><AvatarImage data-ai-hint="person" src={`https://placehold.co/40x40.png`} /><AvatarFallback>{memberData.name.substring(0, 2)}</AvatarFallback></Avatar>
                                                                <div className="flex flex-col"><p className="font-semibold text-foreground">{memberData.name}</p><p className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">{memberId}</p>{user?.uid === memberId && <p className="text-xs text-accent font-semibold">(You)</p>}</div>
                                                            </div><StatusBadge status={memberStatuses[memberId]?.state} />
                                                        </div>
                                                    )) : (<p className="text-sm text-muted-foreground px-2">No members in this role yet.</p>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                                <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban /> Code Share History</CardTitle><CardDescription>Recent code shares from your team.</CardDescription></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Update</TableHead><TableHead>Author</TableHead><TableHead>Time</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {isLoadingShares ? ([...Array(4)].map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-4 w-4/5" /></TableCell><TableCell><Skeleton className="h-4 w-3/4" /></TableCell><TableCell><Skeleton className="h-4 w-1/2" /></TableCell><TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell></TableRow>))
                                            ) : shares.length > 0 ? (shares.map((share) => (
                                                <TableRow key={share.id}>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground flex items-center gap-2">{share.type === 'group' ? <FolderKanban className="h-4 w-4 text-accent" /> : <File className="h-4 w-4 text-accent" />}<span>{share.groupName || share.fileName || share.message}</span></div>
                                                        {share.type !== 'group' && share.fileName && share.message && (<p className="text-sm text-muted-foreground pl-6">{share.message}</p>)}
                                                    </TableCell>
                                                    <TableCell>{share.userName}</TableCell><TableCell>{share.time}</TableCell>
                                                    <TableCell className="text-right">
                                                       {share.type === 'group' ? (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">View Files</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{share.files?.map((file: any, index: number) => (<DropdownMenuItem key={index} onSelect={(e) => e.preventDefault()} className="justify-between gap-4"><span>{file.fileName}</span><Button asChild variant="ghost" size="sm"><Link href={`/collaboration/ide?shareId=${share.id}&fileName=${encodeURIComponent(file.fileName)}`}>Open</Link></Button></DropdownMenuItem>))}</DropdownMenuContent></DropdownMenu>)
                                                        : share.code != null ? (<Button asChild variant="outline" size="sm"><Link href={`/collaboration/ide?shareId=${share.id}`}><Eye className="mr-2 h-4 w-4" />Open</Link></Button>) : null}
                                                    </TableCell>
                                                </TableRow>))
                                            ) : (<TableRow><TableCell colSpan={4} className="h-24 text-center">No shares yet. Make your first one!</TableCell></TableRow>)}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                         <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                             <CardHeader>
                                 <div className="flex flex-wrap items-center justify-between gap-4">
                                     <div>
                                         <CardTitle className="flex items-center gap-3">Project Hub</CardTitle>
                                         <CardDescription>Organize team tasks on the planner or view the calendar.</CardDescription>
                                     </div>
                                     <Tabs defaultValue="planner" className="w-full sm:w-auto">
                                        <TabsList><TabsTrigger value="planner"><FolderKanban className="mr-2 h-4 w-4" /> Planner</TabsTrigger><TabsTrigger value="calendar"><CalendarDays className="mr-2 h-4 w-4" /> Calendar</TabsTrigger></TabsList>
                                     </Tabs>
                                 </div>
                             </CardHeader>
                             <CardContent className="p-0">
                                 <Tabs defaultValue="planner">
                                     <TabsContent value="planner" className="m-0">
                                         <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                                             <div className="p-4">
                                                <ScrollArea className="w-full whitespace-nowrap"><div className="flex gap-4 p-4">{isLoadingPlanner ? <Skeleton className="h-96 w-full" /> : (<SortableContext items={columnsId}>{columns.map(col => (<ColumnContainer key={col.id} column={col} tasks={tasks.filter(task => task.columnId === col.id)} createTask={createTask} />))}</SortableContext>)}</div><div className="h-1 pb-1"></div></ScrollArea>
                                             </div>
                                             {typeof document !== 'undefined' && createPortal(<DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>, document.body)}
                                         </DndContext>
                                     </TabsContent>
                                     <TabsContent value="calendar" className="m-0">
                                         <div className="p-4 md:p-6">
                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                 <div className="lg:col-span-2">
                                                     <Calendar
                                                         mode="single"
                                                         selected={date}
                                                         onSelect={setDate}
                                                         className="w-full border-0 sm:border rounded-md"
                                                         modifiers={calendarModifiers}
                                                         modifiersClassNames={{ hasEvent: 'day-with-event' }}
                                                         classNames={{
                                                             months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                                             month: "space-y-4 w-full", table: "w-full border-collapse", head_row: "flex",
                                                             head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                                                             row: "flex w-full mt-2",
                                                             cell: "w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                                             day: cn(buttonVariants({ variant: "ghost" }), "h-12 w-full p-0 font-normal aria-selected:opacity-100"),
                                                             day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                                             day_today: "bg-accent text-accent-foreground", day_outside: "day-outside text-muted-foreground opacity-50",
                                                             day_disabled: "text-muted-foreground opacity-50", day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground", day_hidden: "invisible",
                                                         }}
                                                     />
                                                 </div>
                                                 <div className="lg:col-span-1">
                                                     <h3 className="text-lg font-semibold font-headline mb-4">
                                                         Events for {date ? format(date, 'PPP') : 'selected date'}
                                                     </h3>
                                                     <Button onClick={() => setIsAddEventDialogOpen(true)} disabled={!date} className="w-full mb-4">
                                                         <Plus className="mr-2 h-4 w-4" /> Add Event
                                                     </Button>
                                                     <ScrollArea className="h-96">
                                                         <div className="space-y-4 pr-4">
                                                             {isEventsLoading ? <Skeleton className="h-24 w-full" />
                                                                 : eventsForSelectedDay.length > 0 ? (
                                                                     eventsForSelectedDay.map(event => (
                                                                         <div key={event.id} className="p-4 rounded-lg border bg-muted/50 relative group">
                                                                             <p className="font-bold">{event.title}</p>
                                                                             <p className="text-sm text-muted-foreground">{event.description}</p>
                                                                             <p className="text-xs text-muted-foreground mt-2">By: {event.creatorName}</p>
                                                                             {user?.uid === event.createdBy && (
                                                                                 <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteEvent(event.id)}>
                                                                                     <Trash2 className="h-4 w-4 text-destructive" />
                                                                                 </Button>
                                                                             )}
                                                                         </div>
                                                                     ))
                                                                 ) : ( <div className="text-center text-muted-foreground py-10">No events for this day.</div> )
                                                             }
                                                         </div>
                                                     </ScrollArea>
                                                 </div>
                                             </div>
                                         </div>
                                     </TabsContent>
                                 </Tabs>
                             </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                 <Button variant="outline" onClick={createNewColumn}><Plus className="mr-2 h-4 w-4" />Add Column</Button>
                                 <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"><Link href="/chat"><MessageSquare className="mr-2 h-4 w-4" /> Open Full Chat</Link></Button>
                            </CardFooter>
                         </Card>
                     </div>
                </div>
            </div>

            <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Event for {date ? format(date, 'PPP') : ''}</DialogTitle>
                        <DialogDescription>Create a new event for your team calendar.</DialogDescription>
                    </DialogHeader>
                    <Form {...eventForm}>
                        <form onSubmit={eventForm.handleSubmit(handleAddEvent)} className="space-y-4 py-4">
                            <FormField control={eventForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., Scrimmage Day" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={eventForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Leave by 8am, bring safety glasses." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <DialogFooter><Button type="submit">Save Event</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ColumnContainer({ column, tasks, createTask }: { column: Column; tasks: Task[]; createTask: (columnId: Id) => void; }) {
    const { setNodeRef } = useSortable({ id: column.id, data: { type: 'Column', column } });
    return (
        <div ref={setNodeRef} className="w-[300px] h-[500px] max-h-[500px] shrink-0 bg-muted/50 rounded-lg shadow-inner flex flex-col border border-border/60">
            <div className="bg-muted/80 text-lg font-bold p-3 border-b border-border/60 flex justify-between items-center">{column.title}<Badge>{tasks.length}</Badge></div>
            <ScrollArea className="flex-grow"><div className="p-2 space-y-2"><SortableContext items={tasks.map(t => t.id)}>{tasks.map(task => <TaskCard key={task.id} task={task} />)}</SortableContext></div></ScrollArea>
            <Button onClick={() => createTask(column.id)} variant="ghost" className="m-2"><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
        </div>
    );
}

function TaskCard({ task }: { task: Task }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'Task', task } });
    const style = { transition, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined };
    if (isDragging) return <div ref={setNodeRef} style={style} className="p-4 bg-card rounded-lg h-[100px] opacity-50 border-2 border-primary" />;
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 bg-card rounded-lg shadow-md cursor-grab active:cursor-grabbing border border-border/70 flex items-start gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /><p className="whitespace-pre-wrap flex-grow">{task.content}</p>
        </div>
    );
}
