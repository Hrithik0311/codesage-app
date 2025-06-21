
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { ShieldCheck, GitBranch, Rocket, Users, Terminal, CheckCircle, Clock, Settings, UploadCloud, Share2, Circle, GitCommit, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const teamMembers = [
  { name: 'Alex Johnson', role: 'Team Lead', status: 'Online' },
  { name: 'Maria Garcia', role: 'Lead Programmer', status: 'Online' },
  { name: 'Sam Lee', role: 'Builder & Designer', status: 'Idle' },
  { name: 'Casey Smith', role: 'Driver', status: 'Offline' },
];

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

const DeploymentStep = ({ icon: Icon, title, status, description, isLast = false }) => {
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
        <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {!isLast && <div className="w-px h-12 bg-border/70 mt-2"></div>}
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className={`text-sm font-medium flex items-center gap-1.5 ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            {status}
        </p>
        <p className="text-sm text-foreground/70 mt-1">{description}</p>
      </div>
    </div>
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

    const handleOpenCommitModal = () => {
        setIsCommitModalOpen(true);
    };

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
                i === stepIndex ? { ...step, status: 'In Progress', description: `Running ${step.title.toLowerCase()}...` } : step
            ));
            
            setTimeout(() => {
                setDeploymentSteps(prev => prev.map((step, i) => 
                    i === stepIndex ? { ...step, status: 'Completed', description: `${step.title} finished successfully.` } : step
                ));
                runStep(stepIndex + 1);
            }, 2000);
        };
        
        runStep(0);
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
                            <h1 className="hidden md:block text-xl md:text-2xl font-bold font-headline">
                                Team Collaboration Hub
                            </h1>
                            <ThemeToggleButton />
                        </div>
                    </div>
                </header>

                <div className="flex-grow container mx-auto p-4 md:p-8">
                    <section className="text-center mb-12 animate-fade-in-up-hero">
                        <h2 className="font-headline text-4xl md:text-5xl font-bold gradient-text hero-title-gradient">Build Together, Win Together</h2>
                        <p className="text-foreground/80 mt-4 max-w-3xl mx-auto text-lg">
                        Real-time IDE, version control, and deployment pipelines, all in one place.
                        </p>
                    </section>
                    
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
                                                    {teamMembers.slice(0, 2).map(member => (
                                                        <Tooltip key={member.name}>
                                                            <TooltipTrigger asChild>
                                                            <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                                                <AvatarImage data-ai-hint="person" src={`https://placehold.co/32x32.png`} />
                                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{member.name}</TooltipContent>
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
                                      description={step.description}
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
                                    <div className="space-y-4">
                                        {teamMembers.map((member) => (
                                            <div key={member.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage data-ai-hint="person" src={`https://placehold.co/40x40.png`} />
                                                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{member.name}</p>
                                                        <p className="text-sm text-muted-foreground">{member.role}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    {'bg-green-500/20 text-green-400 border-green-500/30': member.status === 'Online'},
                                                    {'bg-yellow-500/20 text-yellow-400 border-yellow-500/30': member.status === 'Idle'},
                                                )}>
                                                    {member.status}
                                                </Badge>
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
