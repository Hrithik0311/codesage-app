
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap, ShieldCheck, Cpu, GitPullRequest, Search, BarChart, Bug, Lightbulb, Clock, Wand2, Copy, AlertTriangle } from 'lucide-react';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { codeAnalysis, type CodeAnalysisOutput } from '@/ai/flows/ai-code-completion';

const sampleCode = `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;

@TeleOp(name="Basic: Tank Drive", group="Linear Opmode")
public class BasicTankDrive extends LinearOpMode {

    private DcMotor leftDrive = null;
    private DcMotor rightDrive = null;

    @Override
    public void runOpMode() {
        leftDrive  = hardwareMap.get(DcMotor.class, "left_drive");
        rightDrive = hardwareMap.get(DcMotor.class, "right_drive");

        leftDrive.setDirection(DcMotor.Direction.FORWARD);
        rightDrive.setDirection(DcMotor.Direction.REVERSE);
        
        // This is inefficient inside the loop
        for (int i = 0; i < 100; i++) {
            System.out.println("Looping: " + i);
        }

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

const AnalysisResult = ({ icon: Icon, title, description, colorClass, items }) => (
    <Card className="bg-background/30 border-border/40">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-foreground/80 mb-4">{description}</p>
            {items && items.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {items.map((item, index) => (
                         <AccordionItem key={index} value={`item-${index}`} className="bg-muted/30 border-border/50 rounded-md">
                            <AccordionTrigger className="hover:no-underline px-4 text-left font-semibold">{item.title}</AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <p className="text-foreground/90 whitespace-pre-wrap">{item.details}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <p className="text-foreground/70 text-center py-4">No issues found in this category.</p>
            )}
        </CardContent>
    </Card>
);

export default function CodeIntelligenceClient() {
    const [code, setCode] = useState(sampleCode);
    const [language, setLanguage] = useState('java');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<Omit<CodeAnalysisOutput, 'refactoredCode'> | null>(null);
    const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
    const { toast } = useToast();

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        setAnalysisResults(null);
        setRefactoredCode(null);
    };

    const handleAnalyze = async () => {
        if (!code.trim()) {
            toast({
                title: "No Code Provided",
                description: "Please enter some code to analyze.",
                variant: "destructive",
            });
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResults(null);
        setRefactoredCode(null);
        
        try {
            const results = await codeAnalysis({
                codeSnippet: code,
                programmingLanguage: language,
            });

            const { refactoredCode, ...analysis } = results;

            setAnalysisResults(analysis);
            setRefactoredCode(refactoredCode);

            if (analysis && !analysis.performance.length && !analysis.bugs.length && !analysis.suggestions.length) {
                 toast({
                    title: "Analysis Complete",
                    description: "No major issues were found in your code.",
                });
            } else {
                 toast({
                    title: "Analysis Complete!",
                    description: "The AI has analyzed and refactored your code.",
                });
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            toast({
                title: "Analysis Failed",
                description: "The AI analysis could not be completed. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCopy = () => {
        if (!refactoredCode) return;
        navigator.clipboard.writeText(refactoredCode).then(() => {
            toast({
                title: "Copied!",
                description: "The refactored code has been copied to your clipboard.",
            });
        }).catch(err => {
            console.error("Failed to copy:", err);
            toast({
                title: "Copy Failed",
                description: "Could not copy the code to your clipboard.",
                variant: "destructive",
            });
        });
    };

    const hasIssues = analysisResults && (analysisResults.performance.length > 0 || analysisResults.bugs.length > 0 || analysisResults.suggestions.length > 0);

    return (
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
                            Code Intelligence Suite
                        </h1>
                        <ThemeToggleButton />
                    </div>
                </div>
            </header>

            <div className="flex-grow container mx-auto p-4 md:p-8">
                <section className="text-center mb-12 animate-fade-in-up-hero">
                    <h2 className="font-headline text-4xl md:text-5xl font-bold gradient-text hero-title-gradient">Analyze and Elevate Your Code</h2>
                    <p className="text-foreground/80 mt-4 max-w-3xl mx-auto text-lg">
                        Paste your code below for a comprehensive, AI-powered analysis and instant refactoring.
                    </p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Code Editor Panel */}
                    <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 lg:col-span-1 min-h-[600px] flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle className="flex items-center gap-2"><Cpu /> Your Code</CardTitle>
                            <CardDescription>Paste your code and select the language to analyze.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col p-4 pt-0">
                           <Textarea
                                value={code}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                placeholder="Paste your code here..."
                                className="flex-grow w-full font-mono text-sm bg-muted/50 border-border/60 resize-none"
                           />
                           <div className="flex items-center gap-4 mt-4">
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="w-[200px] bg-muted/50 border-border/60">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-grow bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold py-3 text-base">
                                   <Search className="mr-2 h-5 w-5" />
                                   {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                                </Button>
                           </div>
                        </CardContent>
                    </Card>

                    {/* Results Panel */}
                    <div className="lg:col-span-1 min-h-[600px] max-h-[80vh] overflow-y-auto pr-2 rounded-lg">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center h-full bg-card/80 backdrop-blur-md shadow-2xl border-border/50 rounded-lg">
                                <div className="loading-spinner"></div>
                                <p className="mt-4 text-lg text-foreground/80">
                                    AI is analyzing and refactoring...
                                </p>
                            </div>
                        ) : analysisResults ? (
                            <div className="space-y-6 animate-fade-in-up-hero">
                                {refactoredCode && (
                                     <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><Wand2 /> Refactored Code</CardTitle>
                                            <CardDescription>AI-generated code with all issues fixed. Copy it to your editor.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex flex-col p-4 pt-0">
                                            <Textarea
                                                value={refactoredCode}
                                                readOnly
                                                className="flex-grow w-full font-mono text-sm bg-muted/50 border-border/60 resize-none min-h-[200px]"
                                            />
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0">
                                            <Button onClick={handleCopy} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90 font-semibold">
                                                <Copy className="mr-2 h-5 w-5" />
                                                Copy Code
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )}
                                {hasIssues && (
                                    <>
                                        <AnalysisResult
                                            icon={Zap}
                                            title="Performance"
                                            description="Opportunities to make your code run faster."
                                            colorClass="bg-green-500"
                                            items={analysisResults.performance}
                                        />
                                        <AnalysisResult
                                            icon={Bug}
                                            title="Potential Bugs"
                                            description="Code patterns that might lead to crashes or unexpected behavior."
                                            colorClass="bg-red-500"
                                            items={analysisResults.bugs}
                                        />
                                        <AnalysisResult
                                            icon={Lightbulb}
                                            title="Suggestions"
                                            description="Best practices and improvements for code quality."
                                            colorClass="bg-blue-500"
                                            items={analysisResults.suggestions}
                                        />
                                    </>
                                )}
                            </div>
                        ) : (
                             <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 h-full flex flex-col items-center justify-center text-center p-8">
                                <Search size={64} className="text-primary/70 mb-4" />
                                <h3 className="text-2xl font-headline text-foreground">Awaiting Analysis</h3>
                                <p className="text-foreground/70 mt-2">Click "Run Analysis" to get a report and the refactored code.</p>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="my-12 text-center text-sm text-muted-foreground">
                    <p>The AI can make mistakes, so please double-check it.</p>
                </div>

                <section id="features" className="py-24">
                     <h2 className="font-headline text-4xl font-bold text-center mb-16 gradient-text bg-gradient-to-r from-foreground to-foreground/70">
                        Our Analysis Toolkit
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <Card className="bg-background/20 backdrop-blur-lg border-border/50 text-center p-8 rounded-2xl shadow-xl hover:shadow-accent/20 transition-all duration-300 transform hover:-translate-y-2">
                            <CardHeader className="items-center p-0 mb-4">
                                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                                    <BarChart size={32} />
                                </div>
                                <CardTitle className="font-headline text-xl">Comprehensive Reporting</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-foreground/70">
                                    Generate detailed reports on code quality, performance metrics, and improvement areas.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/20 backdrop-blur-lg border-border/50 text-center p-8 rounded-2xl shadow-xl hover:shadow-accent/20 transition-all duration-300 transform hover:-translate-y-2">
                            <CardHeader className="items-center p-0 mb-4">
                                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                                    <GitPullRequest size={32} />
                                </div>
                                <CardTitle className="font-headline text-xl">Automated Refactoring</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-foreground/70">
                                    Apply AI-suggested refactors with a single click to instantly improve your codebase.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/20 backdrop-blur-lg border-border/50 text-center p-8 rounded-2xl shadow-xl hover:shadow-accent/20 transition-all duration-300 transform hover:-translate-y-2">
                            <CardHeader className="items-center p-0 mb-4">
                                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                                    <Clock size={32} />
                                </div>
                                <CardTitle className="font-headline text-xl">Real-time Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-foreground/70">
                                    Get instant feedback and suggestions as you type, integrated directly into your workflow.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
}
