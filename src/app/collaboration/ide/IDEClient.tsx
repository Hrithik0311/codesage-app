
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
import { ShieldCheck, Copy, Save, Share2, FolderPlus, Folder, FolderOpen, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/lib/firebase';
import { ref as dbRef, get, push, serverTimestamp } from 'firebase/database';
import { fileTreeData, type FileNode as FileExplorerNodeType } from '@/data/ftc-file-tree';
import { cn } from '@/lib/utils';


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

interface FileExplorerNodeProps {
  node: FileExplorerNodeType;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  level?: number;
}

const FileExplorerNode: React.FC<FileExplorerNodeProps> = ({ node, selectedPath, onSelectPath, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const isFolder = node.type === 'folder';
  const isSelected = node.path === selectedPath;

  const handleSelect = () => {
    onSelectPath(node.path);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  const Icon = isFolder ? (isOpen ? FolderOpen : Folder) : FileText;

  return (
    <div className="my-1">
      <div
        className={cn(
          'flex items-center gap-2 p-1.5 rounded-md cursor-pointer',
          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
        )}
        onClick={handleSelect}
        style={{ paddingLeft: `${level * 1.5 + 0.375}rem` }}
      >
        {isFolder && (
          <button onClick={handleToggle} className="p-0 bg-transparent hover:bg-transparent">
            <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
          </button>
        )}
        <Icon className={cn('h-4 w-4 flex-shrink-0', isFolder ? 'text-yellow-400' : 'text-muted-foreground')} />
        <span className="truncate text-sm">{node.name}</span>
      </div>
      {isFolder && isOpen && (
        <div>
          {node.children?.map(child => (
            <FileExplorerNode key={child.path} node={child} selectedPath={selectedPath} onSelectPath={onSelectPath} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};


function IDEContent() {
    const [code, setCode] = useState(sampleCode);
    const { toast } = useToast();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isExplorerShareModalOpen, setIsExplorerShareModalOpen] = useState(false);
    const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
    const [shareMessage, setShareMessage] = useState('');
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();


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

    const handleShareFromExplorer = async () => {
        if (!selectedFilePath || !user || !database) {
            toast({ title: "Error", description: "No file selected or user not authenticated.", variant: "destructive" });
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
            fileName: selectedFilePath.split('/').pop(),
            message: `Shared: ${selectedFilePath}`,
            userId: user.uid,
            userName: user.displayName || user.email,
            timestamp: serverTimestamp(),
        });
        
        toast({ title: "Shared!", description: `'${selectedFilePath.split('/').pop()}' has been announced to the team.` });
        setIsExplorerShareModalOpen(false);
        setSelectedFilePath(null);
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
                            <MenubarItem onClick={() => setIsExplorerShareModalOpen(true)}>Announce File Share</MenubarItem>
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
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-headline font-bold">Real-time Code Share</h1>
                    <Button onClick={() => setIsExplorerShareModalOpen(true)}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Add Files/Folders
                    </Button>
                </div>
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

            <Dialog open={isExplorerShareModalOpen} onOpenChange={setIsExplorerShareModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Share a File or Folder</DialogTitle>
                        <DialogDescription>
                            Select a resource from the project explorer to announce to your team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="h-[50vh] overflow-y-auto border rounded-md p-2 bg-muted/20">
                       {fileTreeData.map(node => (
                         <FileExplorerNode key={node.path} node={node} selectedPath={selectedFilePath} onSelectPath={setSelectedFilePath} />
                       ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExplorerShareModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleShareFromExplorer} disabled={!selectedFilePath}>Share Selection</Button>
                    </DialogFooter>
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
