
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
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ShieldCheck, Copy, Save, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function IDEClient() {
  const [code, setCode] = useState(sampleCode);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      toast({ title: "Copied!", description: "Code copied to clipboard." });
    }).catch(err => {
      toast({ title: "Error", description: "Could not copy code.", variant: "destructive" });
    });
  };
  
  const handleSave = () => {
    toast({ title: "Saved!", description: "Your changes have been saved to the shared session." });
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        toast({ title: "Link Copied!", description: "A shareable link has been copied to your clipboard." });
    });
  };

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
              <MenubarItem onClick={handleSave}>Save Session <span className="ml-auto text-xs">⌘S</span></MenubarItem>
              <MenubarSeparator />
              <MenubarItem asChild><Link href="/collaboration">Close Workspace</Link></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy Code</Button>
            <Button onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
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
    </div>
  );
}
