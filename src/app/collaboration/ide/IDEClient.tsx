
'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  Save, FolderOpen, History, ShieldCheck, FilePlus, FolderPlus, Terminal, Copy, Scissors, Search, UploadCloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

const FileTreeItem: React.FC<{ node: FileNode; onSelectFile: (path: string) => void; activeFilePath: string | null; level: number }> = ({ node, onSelectFile, activeFilePath, level }) => {
  const [isOpen, setIsOpen] = useState(true);

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
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        {isFolder ? (
          <Folder className={cn("h-4 w-4 text-accent transition-transform", isOpen && "rotate-0")} />
        ) : (
          <File className="h-4 w-4 text-foreground/70" />
        )}
        {node.name}
      </a>
      {isFolder && isOpen && node.children && (
        <ul className="space-y-1">
          {node.children.map(child => (
            <FileTreeItem key={child.path} node={child} onSelectFile={onSelectFile} activeFilePath={activeFilePath} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};


export default function IDEClient() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
  const [activeFile, setActiveFile] = useState<{ path: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((path: string) => {
    const content = fileContents.get(path);
    if (content !== undefined) {
      setActiveFile({ path, content });
    }
  }, [fileContents]);

  const handleOpenFolderClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsLoading(true);

    const buildTree = (files: FileList): FileNode[] => {
        const root: { name: string; type: 'folder'; children: Map<string, any> } = { name: 'root', type: 'folder', children: new Map() };

        for (const file of Array.from(files)) {
            const pathParts = file.webkitRelativePath.split('/');
            let currentNode = root;

            pathParts.forEach((part, index) => {
                if (!currentNode.children.has(part)) {
                    currentNode.children.set(part, {
                        name: part,
                        path: pathParts.slice(0, index + 1).join('/'),
                        type: index === pathParts.length - 1 ? 'file' : 'folder',
                        children: new Map(),
                    });
                }
                currentNode = currentNode.children.get(part)!;
            });
        }
        
        const mapToArray = (node: any): FileNode[] | undefined => {
            if (!node.children) return undefined;
            const childrenAsArray = Array.from(node.children.values()).map(childNode => ({
                ...childNode,
                children: mapToArray(childNode)
            })).sort((a, b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            });
            return childrenAsArray.length > 0 ? childrenAsArray : undefined;
        };
        
        return mapToArray(root) || [];
    };
    
    const readFiles = async (files: FileList): Promise<Map<string, string>> => {
        const contents = new Map<string, string>();
        const promises = Array.from(files).map(file => {
            return new Promise<void>(resolve => {
                if(file.size > 5 * 1024 * 1024) { // 5MB limit for text files
                     contents.set(file.webkitRelativePath, "File is too large to display.");
                     resolve();
                     return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    contents.set(file.webkitRelativePath, reader.result as string);
                    resolve();
                };
                reader.onerror = () => {
                    contents.set(file.webkitRelativePath, "Error: Could not read file content.");
                    resolve();
                };
                reader.readAsText(file);
            });
        });
        await Promise.all(promises);
        return contents;
    };
    
    const [tree, contents] = await Promise.all([
        Promise.resolve(buildTree(files)),
        readFiles(files)
    ]);
    
    setFileTree(tree);
    setFileContents(contents);
    setActiveFile(null);
    setIsLoading(false);
    toast({ title: "Folder Loaded", description: `${files.length} files have been loaded into the IDE.` });
  };
  
  const MainContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center gap-4">
          <div className="loading-spinner"></div>
          <p className="text-muted-foreground">Loading project files...</p>
        </div>
      );
    }
    
    if (fileTree.length === 0) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center gap-4">
            <UploadCloud className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold">Welcome to the Live IDE</h3>
            <p className="text-muted-foreground max-w-sm">
                To get started, open a project folder from your local machine using the "File" menu.
            </p>
            <Button onClick={handleOpenFolderClick} className="mt-4">
                <FolderOpen className="mr-2"/> Open Folder
            </Button>
        </div>
      );
    }
    
    return (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-border/50 flex-shrink-0">
                  <h3 className="font-bold text-sm flex items-center gap-2"><FolderOpen className="h-4 w-4"/> Project</h3>
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
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <p>Select a file to view its content.</p>
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
                      <p>Output terminal. Ready.</p>
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
              <MenubarItem onClick={handleOpenFolderClick}>Open Folder...</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => toast({ title: "Save Action", description: "File saving is not implemented in this demo."})}>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
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
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Play /></Button></TooltipTrigger>
                    <TooltipContent><p>Build and Run (Not available)</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Bug /></Button></TooltipTrigger>
                    <TooltipContent><p>Debug (Not available)</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><GitCommit /></Button></TooltipTrigger>
                    <TooltipContent><p>Commit Changes (Not available)</p></TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </div>
        </Menubar>
      </header>
      <div className="flex-grow min-h-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFolderUpload}
            webkitdirectory=""
            directory=""
            multiple
            style={{ display: 'none' }}
          />
        <MainContent />
      </div>
    </div>
  );
}
