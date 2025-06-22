
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { ShieldCheck, GitBranch, Rocket, Users, Terminal, CheckCircle, Clock, Settings, UploadCloud, Share2, Circle, GitCommit, Save, PlusCircle, LogIn, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { database } from '@/lib/firebase';
import { ref as dbRef, set, get, update, onValue, push } from 'firebase/database';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationBell } from '@/components/NotificationBell';


const initialCommits = [
  { hash: 'a1b2c3d', message: 'Feat: Implement new intake mechanism control', author: 'Maria Garcia', time: '2 hours ago' },
  { hash: 'e4f5g6h', message: 'Fix: Corrected autonomous pathing error', author: 'Maria Garcia', time: '5 hours ago' },
  { hash: 'i7j8k9l', message: 'Docs: Update README with build instructions', author: 'Alex Johnson', time: '1 day ago' },
  { hash: 'm0n1o2p', message: 'Refactor: Clean up drivetrain class', author: 'Maria Garcia', time: '2 days ago' },
];

const sampleCode = `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;

@TeleOp(name="Collaborative: Tank Drive", group="Linear Opmode")
public class CollaborativeTankDrive extends LinearOpMode {
    // Other collaborators are watching this file!
    private DcMotor leftDrive = null;
    private DcMotor rightDrive = null;

    @Override
    public void runOpMode() {
        leftDrive  = hardwareMap.get(DcMotor.class, "left_drive");
        rightDrive = hardwareMap.get(DcMotor.class, "right_drive");

        // ... robot initialization
    }
}`;

const initialDeploymentSteps = [
  { id: 'build', icon: Terminal, title: 'Build', status: 'Pending', description: 'Compile the project code.' },
  { id: 'test', icon: Settings, title: 'Unit Tests', status: 'Pending', description: 'Run all automated tests.' },
  { id: 'deploy', icon: UploadCloud, title: 'Deploy to Robot', status: 'Pending', description: 'Upload firmware to the robot controller.' }
];

const memberSchema = z.object({
    name: z.string().min(1, "Member name is required."),
    id: z.string().min(1, "Member ID is required."),
    role: z.string().min(1, "Role is required."),
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
    pin: z.string().min(4, "PIN must be 4-6 digits.").max(6, "PIN must be a 4-6 digit number."),
    members: z.array(memberSchema),
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


export default function CollaborationClient() {
    const [code, setCode] = useState(sampleCode);
    const [commits, setCommits] = useState(initialCommits);
    const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');
    const [deploymentSteps, setDeploymentSteps] = useState(initialDeploymentSteps);
    const [isDeploying, setIsDeploying] = useState(false);
    const { toast } = useToast();
    const { user, loading } = useAuth();
    const router = useRouter();

    const [team, setTeam] = useState<any | null>(null);
    const [isLoadingTeam, setIsLoadingTeam] = useState(true);
    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
    const [isJoinTeamOpen, setIsJoinTeamOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [memberStatuses, setMemberStatuses] = useState<Record<string, { state: string }>>({});


    const createForm = useForm<z.infer<typeof createTeamSchema>>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            teamName: "",
            teamCode: "",
            pin: "",
            members: [],
        },
    });

    const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({
        control: createForm.control,
        name: "members",
    });
    
    useEffect(() => {
        if(isCreateTeamOpen && user && memberFields.length === 0) {
            appendMember({ 
                name: user.displayName || user.email?.split('@')[0] || '', 
                id: user.uid, 
                role: 'Captain' 
            });
        }
    }, [isCreateTeamOpen, user, memberFields, appendMember]);

    const joinForm = useForm<z.infer<typeof joinTeamSchema>>({
        resolver: zodResolver(joinTeamSchema),
        defaultValues: { teamName: "", teamCode: "", pin: "" },
    });
    
    const settingsForm = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: { teamName: "", pin: "", members: [] },
    });

    const { fields: settingsMemberFields, append: appendSettingsMember, remove: removeSettingsMember, replace: replaceSettingsMembers } = useFieldArray({
        control: settingsForm.control,
        name: "members",
    });

    useEffect(() => {
        if (!loading && !user) {
          router.push('/auth');
          return;
        }
        if (user && database) {
          setIsLoadingTeam(true);
          const userTeamRef = dbRef(database, `users/${user.uid}/teamCode`);
          get(userTeamRef).then((snapshot) => {
            if (snapshot.exists()) {
              const teamCode = snapshot.val();
              const teamDataRef = dbRef(database, `teams/${teamCode}`);
              
              const unsubscribe = onValue(teamDataRef, (teamSnapshot) => {
                  if (teamSnapshot.exists()) {
                      const teamData = { id: teamCode, ...teamSnapshot.val() };
                      setTeam(teamData);
                      
                      const membersForForm = [];
                      for (const role in teamData.roles) {
                          for (const id in teamData.roles[role]) {
                              membersForForm.push({ id, name: teamData.roles[role][id], role });
                          }
                      }
                      settingsForm.reset({ teamName: teamData.name, pin: teamData.pin, members: membersForForm });
                      replaceSettingsMembers(membersForForm);

                  } else {
                      setTeam(null);
                  }
                  setIsLoadingTeam(false);
              }, (error) => {
                  console.error("Error fetching team data:", error);
                  toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your team information.' });
                  setIsLoadingTeam(false);
              });

              return () => unsubscribe();

            } else {
              setIsLoadingTeam(false);
            }
          }).catch(error => {
              console.error("Error fetching user team data:", error);
              toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your team information.' });
              setIsLoadingTeam(false);
          });
        }
      }, [user, loading, router, toast]);

    useEffect(() => {
        if (!team || !database) return;

        const allMemberIds = Object.values(team.roles || {}).flatMap((roleMembers: any) => Object.keys(roleMembers));
        if (allMemberIds.length === 0) return;

        const statusRef = dbRef(database, 'status');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const allStatuses = snapshot.val() || {};
            const teamStatuses: Record<string, { state: string }> = {};
            
            allMemberIds.forEach(id => {
                if (allStatuses[id]) {
                    teamStatuses[id] = allStatuses[id];
                }
            });
            setMemberStatuses(teamStatuses);
        });

        return () => unsubscribe();
    }, [team, database]);


    const handleCreateTeam = async (values: z.infer<typeof createTeamSchema>) => {
        if (!user || !database) return;
        
        const teamRef = dbRef(database, 'teams/' + values.teamCode);
        const snapshot = await get(teamRef);
        if (snapshot.exists()) {
            createForm.setError("teamCode", { type: "manual", message: "This team code is already taken." });
            return;
        }

        const rolesData: { [key: string]: { [uid: string]: string } } = {};
        values.members.forEach(member => {
            if (!rolesData[member.role]) {
                rolesData[member.role] = {};
            }
            rolesData[member.role][member.id] = member.name;
        });

        const announcementsChatRef = push(dbRef(database, 'chats'));
        const announcementsChatId = announcementsChatRef.key;
        if (!announcementsChatId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create team channel.' });
            return;
        }

        await set(announcementsChatRef, {
            metadata: {
                name: `${values.teamName} Announcements`,
                type: 'channel',
                teamId: values.teamCode,
            },
        });
        
        const newTeam = {
            name: values.teamName,
            roles: rolesData,
            pin: values.pin,
            creatorUid: user.uid,
            announcementsChatId: announcementsChatId,
        };

        await set(teamRef, newTeam);
        
        const userUpdates: { [key: string]: any } = {};
        values.members.forEach(member => {
            userUpdates[`/users/${member.id}/teamCode`] = values.teamCode;
            userUpdates[`/users/${member.id}/chats/${announcementsChatId}`] = true;
            userUpdates[`/users/${member.id}/name`] = member.name;
        });
        await update(dbRef(database), userUpdates);

        setTeam({ id: values.teamCode, ...newTeam });
        setIsCreateTeamOpen(false);
        createForm.reset();
        toast({ title: 'Success!', description: 'Your team has been created.' });
    };

    const handleJoinTeam = async (values: z.infer<typeof joinTeamSchema>) => {
        if (!user || !database) return;

        const teamRef = dbRef(database, 'teams/' + values.teamCode);
        const snapshot = await get(teamRef);

        if (!snapshot.exists()) {
            joinForm.setError("teamCode", { type: "manual", message: "This team code does not exist." });
            return;
        }

        const teamData = snapshot.val();
        if (teamData.name.toLowerCase() !== values.teamName.toLowerCase()) {
            joinForm.setError("teamName", { type: "manual", message: "Team name does not match the team code." });
            return;
        }
        if (teamData.pin !== values.pin) {
            joinForm.setError("pin", { type: "manual", message: "The PIN for this team is incorrect." });
            return;
        }
        
        const newMemberId = user.uid;
        const isAlreadyMember = Object.values(teamData.roles || {}).some(roleMembers => newMemberId in (roleMembers as object));
        const memberName = user.displayName || user.email?.split('@')[0] || 'New Member';

        const updates: { [key: string]: any } = {};
        
        if (isAlreadyMember) {
            toast({ title: "Already a member", description: "You are already a member of this team." });
        } else {
            const memberPath = `teams/${values.teamCode}/roles/Member/${newMemberId}`;
            updates[memberPath] = memberName;
        }

        updates[`/users/${user.uid}/name`] = memberName;
        updates[`/users/${user.uid}/teamCode`] = values.teamCode;
        if (teamData.announcementsChatId) {
            updates[`/users/${user.uid}/chats/${teamData.announcementsChatId}`] = true;
        }

        await update(dbRef(database), updates);
        
        setIsJoinTeamOpen(false);
        joinForm.reset();
        toast({ title: 'Success!', description: `You have joined the team: ${teamData.name}` });
    };
    
    const handleUpdateTeamSettings = async (values: z.infer<typeof settingsSchema>) => {
        if (!user || !database || !team || user.uid !== team.creatorUid) {
            toast({ variant: 'destructive', title: 'Error', description: 'You do not have permission to change settings.' });
            return;
        }

        const newRoles: { [key: string]: { [uid: string]: string } } = {};
        const userUpdates: { [key: string]: any } = {};

        values.members.forEach(member => {
            if (!newRoles[member.role]) {
                newRoles[member.role] = {};
            }
            newRoles[member.role][member.id] = member.name;
            userUpdates[`/users/${member.id}/name`] = member.name;
        });

        const teamUpdates = {
            name: values.teamName,
            pin: values.pin,
            roles: newRoles,
        };

        try {
            await update(dbRef(database, `teams/${team.id}`), teamUpdates);
            await update(dbRef(database), userUpdates);

            toast({ title: 'Success!', description: 'Team settings have been updated.' });
            setIsSettingsOpen(false);
        } catch (error) {
            console.error("Error updating team settings:", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save team settings.' });
        }
    };

    const handleOpenCommitModal = () => setIsCommitModalOpen(true);

    const handleCommit = () => {
        if (!commitMessage.trim()) {
            toast({ title: 'Error', description: 'Commit message cannot be empty.', variant: 'destructive' });
            return;
        }
        const newCommit = {
            hash: Math.random().toString(36).substring(2, 9),
            message: commitMessage,
            author: 'You',
            time: 'Just now',
        };
        setCommits([newCommit, ...commits]);
        setCommitMessage('');
        setIsCommitModalOpen(false);
        toast({ title: 'Commit Successful!', description: 'Your changes have been saved to version control.' });
    };

    const handleDeploy = () => {
        if (isDeploying) return;
        setIsDeploying(true);
        setDeploymentSteps(initialDeploymentSteps.map(s => ({ ...s, status: 'Pending' })));

        const runStep = (stepIndex: number) => {
            if (stepIndex >= deploymentSteps.length) {
                setIsDeploying(false);
                toast({ title: 'Deployment Successful!', description: 'Your new code is live on the robot.' });
                return;
            }
            
            setDeploymentSteps(prev => prev.map((step, i) => 
                i === stepIndex ? { ...step, status: 'In Progress' } : step
            ));
            
            setTimeout(() => {
                setDeploymentSteps(prev => prev.map((step, i) => 
                    i === stepIndex ? { ...step, status: 'Completed' } : step
                ));
                runStep(stepIndex + 1);
            }, 1500);
        };
        
        runStep(0);
    };

    if (loading || isLoadingTeam) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!team) {
        return (
            <>
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
                <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xl font-headline font-bold">CodeSage</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggleButton />
                        <NotificationBell />
                        <UserProfile />
                    </div>
                </div>
            </header>
            <div className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-3xl">Collaboration Hub</CardTitle>
                        <CardDescription className="text-lg">Create a new team or join an existing one to start collaborating.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="py-8 text-lg">
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Create a Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Create a New Team</DialogTitle>
                                    <DialogDescription>Fill out the details below to get your team started.</DialogDescription>
                                </DialogHeader>
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
                                                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                                                        <FormField control={createForm.control} name={`members.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="text-xs">Member Name</FormLabel><FormControl><Input placeholder="e.g., Alex Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={createForm.control} name={`members.${index}.id`} render={({ field }) => (<FormItem className="flex-grow-[2]"><FormLabel className="text-xs">Member ID</FormLabel><FormControl><Input placeholder="Paste Member ID here" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={createForm.control} name={`members.${index}.role`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="text-xs">Role</FormLabel><FormControl><Input placeholder="e.g., Programmer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeMember(index)} disabled={memberFields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendMember({ name: "", id: "", role: "Member" })}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                                            </Button>
                                        </div>
                                        <DialogFooter className="pt-4 sticky bottom-0 bg-background/90 py-3 -mx-4 px-4">
                                            <Button type="submit" disabled={createForm.formState.isSubmitting}>{createForm.formState.isSubmitting ? 'Creating...' : 'Create Team'}</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isJoinTeamOpen} onOpenChange={setIsJoinTeamOpen}>
                            <DialogTrigger asChild>
                                <Button className="py-8 text-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                                    <LogIn className="mr-2 h-5 w-5" />
                                    Join a Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Join an Existing Team</DialogTitle>
                                    <DialogDescription>Enter the team's details to request access.</DialogDescription>
                                </DialogHeader>
                                <Form {...joinForm}>
                                    <form onSubmit={joinForm.handleSubmit(handleJoinTeam)} className="space-y-4 py-4">
                                        <FormField control={joinForm.control} name="teamName" render={({ field }) => (<FormItem><FormLabel>Team Name</FormLabel><FormControl><Input placeholder="Enter the team's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={joinForm.control} name="teamCode" render={({ field }) => (<FormItem><FormLabel>Team Code</FormLabel><FormControl><Input placeholder="Enter the team's unique code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={joinForm.control} name="pin" render={({ field }) => (<FormItem><FormLabel>Team PIN</FormLabel><FormControl><Input type="password" placeholder="Enter the team's PIN" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <DialogFooter>
                                            <Button type="submit" disabled={joinForm.formState.isSubmitting}>{joinForm.formState.isSubmitting ? 'Joining...' : 'Join Team'}</Button>
                                        </DialogFooter>
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

    const DeploymentStep = ({ icon: Icon, title, status, isLast = false }) => {
        const statusConfig = {
          Completed: { color: 'text-green-500', icon: CheckCircle },
          'In Progress': { color: 'text-yellow-500 animate-pulse', icon: Clock },
          Pending: { color: 'text-foreground/50', icon: Circle }
        };
        const config = statusConfig[status];
        const StatusIcon = config.icon;
        return (
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${config.color}`}><Icon className="w-5 h-5" /></div>
              {!isLast && <div className="w-px h-12 bg-border/70 mt-2"></div>}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{title}</h4>
              <p className={`text-sm font-medium flex items-center gap-1.5 ${config.color}`}><StatusIcon className="w-4 h-4" />{status}</p>
            </div>
          </div>
        );
      };

    return (
        <>
            <div className="min-h-screen flex flex-col text-foreground">
                <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
                    <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-xl font-headline font-bold">CodeSage</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <h1 className="hidden md:block text-xl md:text-2xl font-bold font-headline">
                                    {team.name} Hub
                                </h1>
                            </div>
                             <div className="flex items-center gap-2">
                                <ThemeToggleButton />
                                <NotificationBell />
                                <UserProfile />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow container mx-auto p-4 md:p-8 relative">
                    <section className="text-center mb-12 animate-fade-in-up-hero">
                        <h2 className="font-headline text-4xl md:text-5xl font-bold gradient-text hero-title-gradient">Build Together, Win Together</h2>
                        <p className="text-foreground/80 mt-4 max-w-3xl mx-auto text-lg">
                        Real-time IDE, version control, and deployment pipelines, all in one place.
                        </p>
                    </section>

                    {user?.uid === team.creatorUid && (
                        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
                                    <Settings className="h-5 w-5" />
                                    <span className="sr-only">Team Settings</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Team Settings</DialogTitle>
                                    <DialogDescription>Manage your team's information and members.</DialogDescription>
                                </DialogHeader>
                                <Form {...settingsForm}>
                                    <form onSubmit={settingsForm.handleSubmit(handleUpdateTeamSettings)}>
                                        <Tabs defaultValue="general" className="mt-4">
                                            <TabsList>
                                                <TabsTrigger value="general">General</TabsTrigger>
                                                <TabsTrigger value="members">Members</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="general" className="space-y-6 py-6">
                                                <FormField control={settingsForm.control} name="teamName" render={({ field }) => (<FormItem><FormLabel>Team Name</FormLabel><FormControl><Input placeholder="e.g., The Robo-Wizards" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={settingsForm.control} name="pin" render={({ field }) => (<FormItem><FormLabel>4-6 Digit PIN</FormLabel><FormControl><Input type="password" placeholder="e.g., 123456" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </TabsContent>
                                            <TabsContent value="members" className="py-6 max-h-[50vh] overflow-y-auto">
                                                <div className="space-y-4">
                                                    {settingsMemberFields.map((field, index) => (
                                                        <div key={field.id} className="flex items-end gap-3 p-3 border rounded-md">
                                                            <FormField control={settingsForm.control} name={`members.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="text-xs">Name</FormLabel><FormControl><Input {...field} readOnly={user?.uid !== team.creatorUid} /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={settingsForm.control} name={`members.${index}.id`} render={({ field }) => (<FormItem className="flex-grow-[1.5]"><FormLabel className="text-xs">ID</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={settingsForm.control} name={`members.${index}.role`} render={({ field }) => (
                                                                <FormItem className="w-[150px]">
                                                                    <FormLabel className="text-xs">Role</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="e.g., Programmer" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeSettingsMember(index)} disabled={field.id === team.creatorUid}><Trash2 className="h-4 w-4" /></Button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSettingsMember({ name: "", id: "", role: "Member" })}>
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                                                </Button>
                                            </TabsContent>
                                        </Tabs>
                                        <DialogFooter className="mt-6">
                                            <Button type="submit" disabled={settingsForm.formState.isSubmitting}>{settingsForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content: IDE and Version Control */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            {/* Live IDE Card */}
                            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 flex-grow flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2"><Terminal /> Live IDE</CardTitle>
                                            <CardDescription>File: `src/main/CollaborativeTankDrive.java`</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                <TooltipProvider>
                                                    {Object.values(team.roles || {}).flatMap((members: any) => Object.entries(members)).slice(0, 3).map(([memberId, memberName]) => (
                                                        <Tooltip key={memberId}>
                                                            <TooltipTrigger asChild>
                                                            <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                                                <AvatarImage data-ai-hint="person" src={`https://placehold.co/32x32.png`} />
                                                                <AvatarFallback>{(memberName as string).substring(0, 1)}</AvatarFallback>
                                                            </Avatar>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{memberName as string}</TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </TooltipProvider>
                                            </div>
                                            <Button variant="ghost" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col p-4 pt-0">
                                    <Textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="flex-grow w-full font-mono text-sm bg-muted/50 border-border/60 resize-none min-h-[300px]"
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleOpenCommitModal} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                                        <GitCommit className="mr-2 h-4 w-4" /> Commit Changes
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Version Control Card */}
                            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><GitBranch /> Version Control</CardTitle>
                                    <CardDescription>Showing recent commits to `main` branch.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Commit</TableHead>
                                                <TableHead>Author</TableHead>
                                                <TableHead>Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {commits.map((commit) => (
                                                <TableRow key={commit.hash}>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">{commit.message}</div>
                                                        <div className="text-sm text-muted-foreground font-mono">{commit.hash}</div>
                                                    </TableCell>
                                                    <TableCell>{commit.author}</TableCell>
                                                    <TableCell>{commit.time}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Sidebar: Deployment and Team Members */}
                        <div className="lg:col-span-1 flex flex-col gap-8">
                            {/* Deployment Pipeline Card */}
                            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2"><Rocket /> Deployment</CardTitle>
                                    <Button size="sm" onClick={handleDeploy} disabled={isDeploying}>
                                        <UploadCloud className="mr-2 h-4 w-4" /> {isDeploying ? 'Deploying...' : 'Deploy'}
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  {deploymentSteps.map((step, index) => (
                                    <DeploymentStep 
                                      key={step.id}
                                      icon={step.icon} 
                                      title={step.title} 
                                      status={step.status} 
                                      isLast={index === deploymentSteps.length - 1} 
                                    />
                                  ))}
                                </CardContent>
                            </Card>

                            {/* Team Members Card */}
                            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Users /> Team Members</CardTitle>
                                    <CardDescription>Your current team workspace.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {team.roles && Object.entries(team.roles).map(([roleName, members]: [string, { [uid: string]: string }]) => (
                                            <div key={roleName}>
                                                <h4 className="font-semibold text-muted-foreground mb-3 px-1">{roleName}</h4>
                                                <div className="space-y-4">
                                                    {Object.entries(members).length > 0 ? Object.entries(members).map(([memberId, memberName]) => (
                                                        <div key={memberId} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage data-ai-hint="person" src={`https://placehold.co/40x40.png`} />
                                                                    <AvatarFallback>{memberName.substring(0, 2)}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col">
                                                                    <p className="font-semibold text-foreground">{memberName}</p>
                                                                    <p className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">{memberId}</p>
                                                                    {user?.uid === memberId && <p className="text-xs text-accent font-semibold">(You)</p>}
                                                                </div>
                                                            </div>
                                                            <StatusBadge status={memberStatuses[memberId]?.state} />
                                                        </div>
                                                    )) : (
                                                        <p className="text-sm text-muted-foreground px-2">No members in this role yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            
            <Dialog open={isCommitModalOpen} onOpenChange={setIsCommitModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Commit Changes</DialogTitle>
                        <DialogDescription>
                            Enter a message to describe the changes you made.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            placeholder="e.g., Fix drivetrain alignment issue"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCommitModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCommit}>Commit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
