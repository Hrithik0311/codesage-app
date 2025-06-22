
"use client";

import React from 'react';
import type { Lesson } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BookOpen, Check, ClipboardCheck, Lock, Rocket, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LessonPathProps {
  lessons: Lesson[];
  activeLessonId: string | null;
  completedLessonIds: Set<string>;
  onSelectLesson: (lessonId: string) => void;
}

const getIconForLesson = (lessonType: Lesson['type']) => {
    switch (lessonType) {
        case 'placement': return Rocket;
        case 'lesson': return BookOpen;
        case 'test': return ClipboardCheck;
        default: return Star;
    }
};

const LessonPath: React.FC<LessonPathProps> = ({
  lessons,
  activeLessonId,
  completedLessonIds,
  onSelectLesson,
}) => {
  return (
    <nav className="w-full md:w-80 bg-card/70 backdrop-blur-md p-3 md:p-5 rounded-xl shadow-xl border border-border/30 md:sticky md:top-[calc(theme(spacing.4)_+_6rem)] max-h-[40vh] md:max-h-[calc(100vh-12rem)] mb-4 md:mb-0 flex flex-col">
       <h2 className="text-xl font-semibold font-headline text-foreground mb-4 p-2 flex items-center gap-2 border-b border-border/50 pb-3">
         <Rocket className="text-primary" size={24} />
         Learning Path
       </h2>
      <ScrollArea className="flex-grow pr-2">
        <div className="relative w-full flex justify-center">
            {/* The SVG path background */}
            <svg className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-auto" width="100" height="100%" viewBox="0 0 100 1200" preserveAspectRatio="none">
                <path d="M 50 0 C 50 10, 80 20, 50 60 S 20 100, 50 140 S 80 180, 50 220 S 20 260, 50 300 S 80 340, 50 380 S 20 420, 50 460 S 80 500, 50 540 S 20 580, 50 620 S 80 660, 50 700 S 20 740, 50 780 S 80 820, 50 860 S 20 900, 50 940 S 80 980, 50 1020 S 20 1060, 50 1100 S 80 1140, 50 1180 V 1200" 
                fill="none" stroke="hsl(var(--border))" strokeWidth="4" strokeDasharray="8 8"/>
            </svg>

            <ul className="space-y-12 py-8 relative z-10">
                <TooltipProvider>
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isUnlocked = index === 0 || completedLessonIds.has(lessons[index-1].id);
                    const isActive = lesson.id === activeLessonId;
                    const Icon = getIconForLesson(lesson.type);

                    const nodeStateClasses = {
                        completed: "bg-green-500 border-green-400 text-white shadow-green-500/40",
                        active: "bg-accent border-accent-foreground text-accent-foreground shadow-accent/40 animate-pulse",
                        unlocked: "bg-primary border-primary/80 text-primary-foreground shadow-primary/40",
                        locked: "bg-muted border-border text-muted-foreground shadow-sm",
                    };

                    let state: keyof typeof nodeStateClasses = 'locked';
                    if (isCompleted) state = 'completed';
                    else if (isActive) state = 'active';
                    else if (isUnlocked) state = 'unlocked';
                    
                    return (
                        <li key={lesson.id} className="flex justify-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        disabled={!isUnlocked}
                                        onClick={() => onSelectLesson(lesson.id)}
                                        className={cn(
                                            "w-20 h-20 rounded-full flex flex-col items-center justify-center p-2 transition-all duration-300 transform hover:scale-110 shadow-lg border-4",
                                            nodeStateClasses[state],
                                            !isUnlocked && "cursor-not-allowed"
                                        )}
                                    >
                                        {isCompleted ? <Check size={32} /> : !isUnlocked ? <Lock size={28} /> : <Icon size={28} />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p className="font-semibold">{lesson.title}</p>
                                    {!isUnlocked && <p className="text-xs text-muted-foreground">Complete previous lesson to unlock</p>}
                                </TooltipContent>
                            </Tooltip>
                        </li>
                    )
                })}
                </TooltipProvider>
            </ul>
        </div>
      </ScrollArea>
    </nav>
  );
};

export default LessonPath;
