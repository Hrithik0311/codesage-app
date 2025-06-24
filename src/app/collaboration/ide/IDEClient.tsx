
'use client';

import React, { useState } from 'react';
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
  Save, FolderOpen, History, ShieldCheck, FilePlus, FolderPlus, Terminal, Trash, Copy, Scissors, Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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

        leftDrive.setDirection(DcMotor.Direction.FORWARD);
        rightDrive.setDirection(DcMotor.Direction.REVERSE);

        waitForStart();

        while (opModeIsActive()) {
            double leftPower;
            double rightPower;

            leftPower  = -gamepad1.left_stick_y ;
            rightPower = -gamepad1.right_stick_y ;

            leftDrive.setPower(leftPower);
            rightDrive.setPower(rightPower);

            telemetry.addData("Left", "%.2f", leftPower);
            telemetry.addData("Right", "%.2f", rightPower);
            telemetry.update();
        }
    }
}`;

const fileStructure = [
  { name: 'teamcode', type: 'folder', children: [
    { name: 'Autonomous', type: 'folder', children: [
      { name: 'BlueAllianceAuto.java', type: 'file' },
      { name: 'RedAllianceAuto.java', type: 'file' },
    ]},
    { name: 'TeleOp', type: 'folder', children: [
      { name: 'MainTeleOp.java', type: 'file' },
    ]},
    { name: 'Subsystems', type: 'folder', children: [
      { name: 'Drivetrain.java', type: 'file' },
      { name: 'Lift.java', type: 'file' },
      { name: 'Intake.java', type: 'file' },
    ]},
    { name: 'CollaborativeTankDrive.java', type: 'file', active: true },
  ]},
  { name: 'build.gradle', type: 'file' },
  { name: 'settings.gradle', type: 'file' },
];

const renderFileTree = (files) => {
  return (
    <ul className="space-y-1">
      {files.map((file) => (
        <li key={file.name}>
          <a href="#" className={cn(
            "flex items-center gap-2 p-1.5 rounded-md text-sm hover:bg-muted/50",
            file.active && "bg-muted font-semibold"
          )}>
            {file.type === 'folder' ? <Folder className="h-4 w-4 text-accent" /> : <File className="h-4 w-4 text-foreground/70" />}
            {file.name}
          </a>
          {file.children && (
            <div className="pl-4 border-l border-border/50 ml-2">
              {renderFileTree(file.children)}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
};

export default function IDEClient() {
  const [code, setCode] = useState(sampleCode);
  const { toast } = useToast();
  const { theme } = useTheme();
  
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
              <MenubarItem>New File <MenubarShortcut><FilePlus/></MenubarShortcut></MenubarItem>
              <MenubarItem>New Folder <MenubarShortcut><FolderPlus/></MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => toast({ title: "Saved", description: "Your file has been saved."})}>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Close Workspace</MenubarItem>
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
              <MenubarItem>Run Build <MenubarShortcut>⌘R</MenubarShortcut></MenubarItem>
              <MenubarItem>Debug <MenubarShortcut>⌘D</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <div className="flex-grow" />
          <div className="flex items-center gap-2">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Play /></Button></TooltipTrigger>
                    <TooltipContent><p>Build and Run</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Bug /></Button></TooltipTrigger>
                    <TooltipContent><p>Debug</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><GitCommit /></Button></TooltipTrigger>
                    <TooltipContent><p>Commit Changes</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Settings /></Button></TooltipTrigger>
                    <TooltipContent><p>Settings</p></TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </div>
        </Menubar>
      </header>
      <div className="flex-grow min-h-0">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-border/50 flex-shrink-0">
                  <h3 className="font-bold text-sm flex items-center gap-2"><FolderOpen className="h-4 w-4"/> Project</h3>
              </div>
              <ScrollArea className="flex-grow p-2">
                {renderFileTree(fileStructure)}
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={75} minSize={30}>
                <div className="h-full flex flex-col bg-background">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border/50 flex-shrink-0 shadow-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="text-sm text-foreground/80">CollaborativeTankDrive.java</div>
                    </div>
                    <div className="flex-grow relative">
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
                            spellCheck="false"
                        />
                    </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={15}>
                <div className="h-full flex flex-col">
                    <div className="p-2 border-b border-border/50 flex-shrink-0">
                        <h3 className="font-bold text-sm flex items-center gap-2"><Terminal className="h-4 w-4"/> Terminal</h3>
                    </div>
                    <ScrollArea className="flex-grow p-4 text-xs bg-black text-white/80">
                      <p>$ ./gradlew build</p>
                      <p className="text-green-400">BUILD SUCCESSFUL in 2s</p>
                      <p>1 actionable task: 1 executed</p>
                      <br />
                      <p>$</p>
                    </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
