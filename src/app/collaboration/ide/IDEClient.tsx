
'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShieldCheck, Copy, Save, Upload, FolderUp, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/lib/firebase';
import { ref as dbRef, get, push, serverTimestamp } from 'firebase/database';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sendNotificationEmail } from '@/ai/flows/send-notification-email';

const shareGroupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required.'),
  files: z.array(z.custom<File>()).min(1, { message: 'Please select at least one file.' }),
});


function IDEContent() {
    const [code, setCode] = useState("");
    const { toast } = useToast();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isShareGroupModalOpen, setIsShareGroupModalOpen] = useState(false);
    const [shareMessage, setShareMessage] = useState('');
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const groupFileInputRef = useRef<HTMLInputElement>(null);

    const shareGroupForm = useForm<z.infer<typeof shareGroupSchema>>({
        resolver: zodResolver(shareGroupSchema),
        defaultValues: {
            groupName: '',
            files: [],
        },
    });

    const watchedFiles = shareGroupForm.watch('files');

    useEffect(() => {
        const shareId = searchParams.get('shareId');
        const fileName = searchParams.get('fileName');
        if (shareId && user && database) {
            const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
            get(teamCodeRef).then((snapshot) => {
                if(snapshot.exists()) {
                    const teamCode = snapshot.val();
                    const shareRef = dbRef(database, `teams/${teamCode}/shares/${shareId}`);
                    get(shareRef).then((shareSnapshot) => {
                        if (shareSnapshot.exists()) {
                            const shareData = shareSnapshot.val();

                            if (fileName && shareData.type === 'group' && shareData.files) {
                                const fileToLoad = shareData.files.find(f => f.fileName === fileName);
                                if (fileToLoad) {
                                    setCode(fileToLoad.code);
                                    setShareMessage(shareData.groupName || '');
                                } else {
                                    toast({ title: "File not found", description: `The file "${fileName}" was not found in this group.`, variant: "destructive" });
                                }
                            } else if (shareData.code != null) { 
                                setCode(shareData.code);
                                setShareMessage(shareData.fileName || shareData.message || '');
                            } else {
                                toast({ title: "Cannot Open", description: "This share is an announcement and does not contain viewable content.", variant: "destructive" });
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

    const notifyTeamCreator = async (teamCode: string, title: string, body: string) => {
        const teamRef = dbRef(database, `teams/${teamCode}/creatorUid`);
        const creatorUidSnapshot = await get(teamRef);
        if (creatorUidSnapshot.exists()) {
            const creatorUid = creatorUidSnapshot.val();
            const creatorRef = dbRef(database, `users/${creatorUid}`);
            const creatorSnapshot = await get(creatorRef);
             if (creatorSnapshot.exists()) {
                const creatorData = creatorSnapshot.val();
                if (creatorData.notificationSettings?.email && creatorData.email) {
                    sendNotificationEmail({
                        to: creatorData.email,
                        subject: title,
                        body: body,
                    }).catch(e => console.error("Failed to send share notification:", e));
                }
            }
        }
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
        
        toast({ title: "Success!", description: "Successfully shared the code snippet." });
        setIsSaveModalOpen(false);
        setShareMessage('');

        // Notify creator
        notifyTeamCreator(
            teamCode, 
            `New Code Snippet from ${user.displayName || user.email}`,
            `<h1>New Code Snippet Shared</h1><p>${user.displayName || user.email} shared a new code snippet with the message: "${shareMessage}". You can view it in the Collaboration Hub.</p>`
        );

        router.replace('/collaboration');
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (!user || !database) {
            toast({ title: "Authentication Error", description: "You must be logged in to share files.", variant: "destructive" });
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

        const readFileAsText = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        };
        
        try {
            const fileArray = Array.from(files);
            for (const file of fileArray) {
                const content = await readFileAsText(file);
                await push(sharesRef, {
                    type: 'file',
                    fileName: file.name,
                    message: "Shared from computer",
                    code: content,
                    userId: user.uid,
                    userName: user.displayName || user.email,
                    timestamp: serverTimestamp(),
                });
            }

            toast({ title: "Success!", description: `Successfully shared ${fileArray.length} file(s).` });
            router.replace('/collaboration');

        } catch (error) {
             console.error("Error sharing file(s):", error);
            toast({ title: 'Sharing Failed', description: 'Could not share the file(s).', variant: 'destructive' });
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    
    const handleGroupFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = event.target.files;
        if (newFiles) {
            const currentFiles = shareGroupForm.getValues('files') || [];
            const combinedFiles = [...currentFiles];
            Array.from(newFiles).forEach(newFile => {
                if (!combinedFiles.some(existingFile => existingFile.name === newFile.name)) {
                    combinedFiles.push(newFile);
                }
            });
            shareGroupForm.setValue('files', combinedFiles, { shouldValidate: true });
        }
        // Reset the file input so the same file can be selected again if removed
        if (event.target) {
            event.target.value = "";
        }
    };
    
    const removeFileFromGroup = (fileName: string) => {
        const currentFiles = shareGroupForm.getValues('files') || [];
        const updatedFiles = currentFiles.filter(file => file.name !== fileName);
        shareGroupForm.setValue('files', updatedFiles, { shouldValidate: true });
    };

    const handleShareGroup = async (values: z.infer<typeof shareGroupSchema>) => {
        if (!user || !database) return;
        
        const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
        const teamCodeSnapshot = await get(teamCodeRef);
        if (!teamCodeSnapshot.exists()) {
            toast({ title: "Team not found", description: "You must be part of a team to share code.", variant: "destructive" });
            return;
        }
        const teamCode = teamCodeSnapshot.val();
        const sharesRef = dbRef(database, `teams/${teamCode}/shares`);

        const readFileAsText = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        };

        try {
            const filesToUpload = values.files;
            const fileData = await Promise.all(
                filesToUpload.map(async (file) => ({
                    fileName: file.name,
                    code: await readFileAsText(file),
                }))
            );
            
            await push(sharesRef, {
                type: 'group',
                groupName: values.groupName,
                files: fileData,
                userId: user.uid,
                userName: user.displayName || user.email,
                timestamp: serverTimestamp(),
            });

            toast({ title: 'Success!', description: `Successfully shared the "${values.groupName}" group.` });
            
             // Notify creator
            notifyTeamCreator(
                teamCode, 
                `New File Group from ${user.displayName || user.email}`,
                `<h1>New File Group Shared</h1><p>${user.displayName || user.email} shared a new file group named "${values.groupName}". You can view it in the Collaboration Hub.</p>`
            );

            closeGroupShareDialog();
            router.replace('/collaboration');
        } catch (error) {
            console.error("Error sharing group:", error);
            toast({ title: 'Sharing Failed', description: 'Could not share the file group.', variant: 'destructive' });
        }
    };

    const closeGroupShareDialog = () => {
        setIsShareGroupModalOpen(false);
        shareGroupForm.reset();
    };


    if (authLoading) {
        return <div className="flex h-screen w-screen items-center justify-center bg-background"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-background text-foreground">
            <header className="flex-shrink-0 border-b border-border/50 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button asChild variant="outline">
                        <Link href="/collaboration">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="font-headline font-bold">CodeSage</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Share Files from Computer
                    </Button>
                    <Button variant="outline" onClick={() => setIsShareGroupModalOpen(true)}>
                        <FolderUp className="mr-2 h-4 w-4" />
                        Share Files as a Group
                    </Button>
                    <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy Code</Button>
                    <Button onClick={handleOpenSaveDialog}><Save className="mr-2 h-4 w-4" /> Save & Share</Button>
                </div>
            </header>
            <main className="flex-grow flex flex-col p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-headline font-bold">Real-time Code Share</h1>
                </div>
                <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Type your code here to share..."
                    className="flex-grow w-full font-mono text-sm bg-muted/30 border-border/60 resize-none"
                />
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
            
            <Dialog open={isShareGroupModalOpen} onOpenChange={closeGroupShareDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Files as a Group</DialogTitle>
                        <DialogDescription>
                            Provide a group name and select multiple files to share as a single item in the history.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...shareGroupForm}>
                        <form onSubmit={shareGroupForm.handleSubmit(handleShareGroup)} className="space-y-4 py-4">
                             <FormField
                                control={shareGroupForm.control}
                                name="groupName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Autonomous Logic Files" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="space-y-2">
                                <FormLabel>Selected Files</FormLabel>
                                {watchedFiles.length > 0 ? (
                                    <div className="space-y-2 rounded-md border p-2 max-h-40 overflow-y-auto">
                                        {watchedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm p-1 bg-muted/50 rounded">
                                                <span className="truncate pr-2">{file.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0"
                                                    onClick={() => removeFileFromGroup(file.name)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-20 border-2 border-dashed rounded-md text-muted-foreground">
                                        <p>No files selected.</p>
                                    </div>
                                )}
                                <FormMessage>{shareGroupForm.formState.errors.files?.message}</FormMessage>
                            </div>

                            <div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => groupFileInputRef.current?.click()}
                                >
                                    Add Files
                                </Button>
                                <Input 
                                    type="file" 
                                    multiple
                                    ref={groupFileInputRef}
                                    className="hidden"
                                    onChange={handleGroupFileChange}
                                />
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={closeGroupShareDialog}>Cancel</Button>
                                <Button type="submit">Share Group</Button>
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
