
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Copy, Save, Share2, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/lib/firebase';
import { ref as dbRef, get, push, serverTimestamp } from 'firebase/database';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const sampleCode = `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;

@TeleOp(name="Shared Code Snippet", group="Examples")
public class SharedCode extends LinearOpMode {

    private DcMotor leftDrive = null;
    private DcMotor rightDrive = null;

    @Override
    public void runOpMode() {
        leftDrive  = hardwareMap.get(DcMotor.class, "left_drive");
        rightDrive = hardwareMap.get(DcMotor.class, "right_drive");

        leftDrive.setDirection(DcMotor.Direction.FORWARD);
        rightDrive.setDirection(DcMotor.Direction.REVERSE);

        waitForStart();

        while (opModeIsActive()) {
            double drivePower = -gamepad1.left_stick_y;
            leftDrive.setPower(drivePower);
            rightDrive.setPower(drivePower);
        }
    }
}`;

const fileShareSchema = z.object({
    name: z.string().min(1, "File or folder name is required."),
    message: z.string().optional(),
});

function IDEContent() {
    const [code, setCode] = useState(sampleCode);
    const { toast } = useToast();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isFileShareModalOpen, setIsFileShareModalOpen] = useState(false);
    const [shareMessage, setShareMessage] = useState('');
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const fileShareForm = useForm<z.infer<typeof fileShareSchema>>({
        resolver: zodResolver(fileShareSchema),
        defaultValues: { name: "", message: "" },
    });

    useEffect(() => {
        const shareId = searchParams.get('shareId');
        if (shareId && user && database) {
            const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
            get(teamCodeRef).then((snapshot) => {
                if(snapshot.exists()) {
                    const teamCode = snapshot.val();
                    const shareRef = dbRef(database, `teams/${teamCode}/shares/${shareId}`);
                    get(shareRef).then((shareSnapshot) => {
                        if (shareSnapshot.exists()) {
                            const shareData = shareSnapshot.val();
                            if (shareData.type === 'snippet') {
                                setCode(shareData.code);
                                setShareMessage(shareData.message);
                            } else {
                                toast({ title: "Invalid Share", description: "This share is a file announcement and cannot be opened in the editor.", variant: "destructive" });
                            }
                        } else {
                            toast({ title: "Share not found", description: "This share could not be loaded.", variant: "destructive" });
                        }
                    });
                }
            });
        }
    }, [searchParams, user, database, toast]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            toast({ title: "Copied!", description: "Code copied to clipboard." });
        }).catch(err => {
            toast({ title: "Error", description: "Could not copy code.", variant: "destructive" });
        });
    };

    const handleOpenSaveDialog = () => {
        setIsSaveModalOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!shareMessage.trim()) {
            toast({ title: "Message required", description: "Please enter a message for your share.", variant: "destructive" });
            return;
        }
        if (!user || !database) {
             toast({ title: "Authentication Error", description: "You must be logged in to save.", variant: "destructive" });
             return;
        }

        const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
        const teamCodeSnapshot = await get(teamCodeRef);
        if (!teamCodeSnapshot.exists()) {
            toast({ title: "Team not found", description: "You must be part of a team to share code.", variant: "destructive" });
            return;
        }
        const teamCode = teamCodeSnapshot.val();
        
        const sharesRef = dbRef(database, `teams/${teamCode}/shares`);
        await push(sharesRef, {
            type: 'snippet',
            code: code,
            message: shareMessage,
            userId: user.uid,
            userName: user.displayName || user.email,
            timestamp: serverTimestamp(),
        });
        
        toast({ title: "Saved!", description: "Your code has been saved and shared with the team." });
        setIsSaveModalOpen(false);
        setShareMessage('');
        router.push('/collaboration');
    };
  
    const handleShareLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast({ title: "Link Copied!", description: "A shareable link has been copied to your clipboard." });
        });
    };

    const handleConfirmFileShare = async (values: z.infer<typeof fileShareSchema>) => {
        if (!user || !database) {
            toast({ title: "Authentication Error", description: "You must be logged in to share.", variant: "destructive" });
            return;
        }

        const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
        const teamCodeSnapshot = await get(teamCodeRef);
        if (!teamCodeSnapshot.exists()) {
            toast({ title: "Team not found", description: "You must be part of a team to share.", variant: "destructive" });
            return;
        }
        const teamCode = teamCodeSnapshot.val();
        
        const sharesRef = dbRef(database, `teams/${teamCode}/shares`);
        await push(sharesRef, {
            type: 'file',
            fileName: values.name,
            message: values.message,
            userId: user.uid,
            userName: user.displayName || user.email,
            timestamp: serverTimestamp(),
        });
        
        toast({ title: "Shared!", description: "Your file announcement has been shared with the team." });
        setIsFileShareModalOpen(false);
        fileShareForm.reset();
    };

    if (authLoading) {
        return <div className="flex h-screen w-screen items-center justify-center bg-background"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-background text-foreground">
            <header className="flex-shrink-0 border-b border-border/50 px-4 py-2 flex items-center justify-between">
                <Menubar className="border-none rounded-none bg-transparent">
                    <Link href="/collaboration" className="flex items-center gap-2 mr-4 px-2 hover:bg-muted rounded-md">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="font-headline font-bold">CodeSage</span>
                    </Link>
                    <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={handleOpenSaveDialog}>Save and Share Snippet<span className="ml-auto text-xs">⌘S</span></MenubarItem>
                            <MenubarItem onClick={() => setIsFileShareModalOpen(true)}>Announce File Share</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem asChild><Link href="/collaboration">Close Workspace</Link></MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy Code</Button>
                    <Button variant="outline" onClick={handleShareLink}><Share2 className="mr-2 h-4 w-4" /> Share Link</Button>
                    <Button onClick={handleOpenSaveDialog}><Save className="mr-2 h-4 w-4" /> Save & Share</Button>
                </div>
            </header>
            <main className="flex-grow flex flex-col p-4">
                <h1 className="text-2xl font-headline font-bold mb-4">Real-time Code Share</h1>
                <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here to share with your team..."
                    className="flex-grow w-full font-mono text-sm bg-muted/30 border-border/60 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">Any changes you make here are visible to everyone currently in this session.</p>
            </main>

            <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save & Share Code Snippet</DialogTitle>
                        <DialogDescription>
                            Enter a brief message to describe this version of the code. This will be saved as a shareable snippet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input 
                            value={shareMessage}
                            onChange={(e) => setShareMessage(e.target.value)}
                            placeholder="e.g., Initial TeleOp with mecanum drive"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmSave}>Save Snippet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isFileShareModalOpen} onOpenChange={setIsFileShareModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Announce a File or Folder Share</DialogTitle>
                        <DialogDescription>
                            Share a resource with your team. This will appear in the history feed as an announcement.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...fileShareForm}>
                        <form onSubmit={fileShareForm.handleSubmit(handleConfirmFileShare)} className="space-y-4 py-4">
                            <FormField control={fileShareForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>File/Folder Name</FormLabel><FormControl><Input placeholder="e.g., new-design.pdf or /designs/v2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fileShareForm.control} name="message" render={({ field }) => (<FormItem><FormLabel>Message (Optional)</FormLabel><FormControl><Textarea placeholder="Describe the share..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsFileShareModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={fileShareForm.formState.isSubmitting}>{fileShareForm.formState.isSubmitting ? 'Sharing...' : 'Share Announcement'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function IDEClient() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-background"><div className="loading-spinner"></div></div>}>
            <IDEContent />
        </Suspense>
    )
}
