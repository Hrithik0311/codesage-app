
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Code2, Folder, File, Play, Bug, GitCommit, Settings,
  Save, FolderOpen, History, ShieldCheck, FilePlus, FolderPlus, Terminal, Copy, Scissors, Search, UploadCloud, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { fileTreeData, fileContentData, type FileNode } from '@/data/ftc-file-tree';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/lib/firebase';
import { ref as dbRef, get, push, serverTimestamp } from 'firebase/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';


const FileTreeItem: React.FC<{ node: FileNode; onSelectFile: (path: string) => void; activeFilePath: string | null; level: number }> = ({ node, onSelectFile, activeFilePath, level }) => {
  const [isOpen, setIsOpen] = useState(level === 0);

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  const isFolder = node.type === 'folder';
  const isActive = node.path === activeFilePath;

  return (
    <li>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); handleToggle(); }}
        className={cn(
          "flex items-center gap-2 p-1.5 rounded-md text-sm hover:bg-muted/50",
          isActive && "bg-muted font-semibold"
        )}
        style={{ paddingLeft: `${level * 1.25}rem` }}
      >
        {isFolder ? (
            <ChevronDown className={cn("h-4 w-4 text-foreground/70 transition-transform", !isOpen && "-rotate-90")} />
        ) : (
          <File className="h-4 w-4 text-foreground/70" />
        )}
        {node.name}
      </a>
      {isFolder && isOpen && node.children && (
        <ul className="space-y-1 mt-1">
          {node.children.map(child => (
            <FileTreeItem key={child.path} node={child} onSelectFile={onSelectFile} activeFilePath={activeFilePath} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};


export default function IDEClient() {
  const [fileTree] = useState<FileNode[]>(fileTreeData);
  const [fileContents] = useState<Map<string, string>>(fileContentData);
  const [activeFile, setActiveFile] = useState<{ path: string; content: string } | null>(null);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');


  useEffect(() => {
    if (user && database) {
        const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
        get(teamCodeRef).then((snapshot) => {
            if (snapshot.exists()) {
                setTeamCode(snapshot.val());
            }
        });
    }
  }, [user]);

  const handleFileSelect = useCallback((path: string) => {
    const content = fileContents.get(path);
    setActiveFile({ path, content: content || `// Content for ${path}` });
  }, [fileContents]);
  
  const handleCommit = async () => {
    if (!commitMessage.trim()) {
        toast({ title: 'Error', description: 'Commit message cannot be empty.', variant: 'destructive' });
        return;
    }

    if (teamCode && user && database) {
        const activitiesRef = dbRef(database, `teams/${teamCode}/activities`);
        await push(activitiesRef, {
            type: 'commit',
            userId: user.uid,
            userName: user.displayName || user.email,
            details: {
                message: commitMessage,
            },
            timestamp: serverTimestamp(),
        });
    }

    setCommitMessage('');
    setIsCommitModalOpen(false);
    toast({ title: 'Commit Successful!', description: 'Your changes have been saved to version control.' });
  };
  
  if (loading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="loading-spinner"></div>
        </div>
    );
  }

  const MainContent = () => {
    return (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-border/50 flex-shrink-0">
                  <h3 className="font-bold text-sm flex items-center gap-2 p-2"><FolderOpen className="h-4 w-4"/> Testing_Ftc_robot_controller</h3>
              </div>
              <ScrollArea className="flex-grow p-2">
                 <ul className="space-y-1">
                  {fileTree.map(node => (
                    <FileTreeItem key={node.path} node={node} onSelectFile={handleFileSelect} activeFilePath={activeFile?.path ?? null} level={0} />
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={75} minSize={30}>
                {activeFile ? (
                    <div className="h-full flex flex-col bg-background">
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border/50 flex-shrink-0 shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            </div>
                            <div className="text-sm text-foreground/80">{activeFile.path.split('/').pop()}</div>
                        </div>
                        <div className="flex-grow relative">
                            <Textarea
                                value={activeFile.content}
                                readOnly
                                className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
                                spellCheck="false"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-center gap-4 text-muted-foreground">
                       <Code2 className="h-16 w-16 text-muted-foreground/50" />
                       <h3 className="text-xl font-semibold">Select a file to begin editing.</h3>
                       <p className="max-w-sm">Choose a file from the explorer on the left to view its contents and start working.</p>
                    </div>
                )}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={15}>
                <div className="h-full flex flex-col">
                    <div className="p-2 border-b border-border/50 flex-shrink-0">
                        <h3 className="font-bold text-sm flex items-center gap-2"><Terminal className="h-4 w-4"/> Terminal</h3>
                    </div>
                    <ScrollArea className="flex-grow p-4 text-xs bg-black text-white/80">
                      <p className="text-green-400">> build successful</p>
                      <p>> ready</p>
                      <br />
                      <p>$</p>
                    </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
    );
  };
  
  return (
    <div className="h-screen w-screen flex flex-col bg-card text-foreground font-mono">
      <header className="flex-shrink-0 border-b border-border/50 px-2">
        <Menubar className="border-none rounded-none bg-transparent">
            <Link href="/collaboration" className="flex items-center gap-2 mr-4 px-2 hover:bg-muted rounded-md">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-headline font-bold">CodeSage</span>
            </Link>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => toast({ title: "Action not available in demo."})}>New File</MenubarItem>
              <MenubarItem onClick={() => toast({ title: "Action not available in demo."})}>New Folder</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => toast({ title: "Action not available in demo."})}>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem asChild><Link href="/collaboration">Close Workspace</Link></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
           <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut <MenubarShortcut><Scissors /></MenubarShortcut></MenubarItem>
              <MenubarItem>Copy <MenubarShortcut><Copy /></MenubarShortcut></MenubarItem>
              <MenubarItem>Paste</MenubarItem>
              <MenubarSeparator />
               <MenubarItem>Find <MenubarShortcut><Search /></MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
           <MenubarMenu>
            <MenubarTrigger>Run</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => toast({title: "Action not available"})}>Run Build <MenubarShortcut>⌘R</MenubarShortcut></MenubarItem>
              <MenubarItem onClick={() => toast({title: "Action not available"})}>Debug <MenubarShortcut>⌘D</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <div className="flex-grow" />
          <div className="flex items-center gap-2">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({title: "Build & Run not available in demo."})}><Play /></Button></TooltipTrigger>
                    <TooltipContent><p>Build and Run (Not available)</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({title: "Debug not available in demo."})}><Bug /></Button></TooltipTrigger>
                    <TooltipContent><p>Debug (Not available)</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCommitModalOpen(true)} disabled={!user || !teamCode}>
                            <GitCommit />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Commit Changes</p></TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </div>
        </Menubar>
      </header>
      <div className="flex-grow min-h-0">
        <MainContent />
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
                      placeholder="e.g., Implement new feature"
                  />
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCommitModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleCommit}>Commit</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
