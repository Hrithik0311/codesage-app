
"use client";

import React from 'react';
import type { Lesson } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BookOpen, Check, ClipboardList, Lock, Rocket, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LessonNavigationProps {
  lessons: Lesson[];
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  completedLessonIds: Set<string>;
}

const getIconForLesson = (lessonType: Lesson['type']) => {
    switch (lessonType) {
        case 'placement': return Rocket;
        case 'lesson': return BookOpen;
        case 'test': return ClipboardList;
        default: return Star;
    }
};

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  lessons,
  activeLessonId,
  onSelectLesson,
  completedLessonIds,
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
            <svg className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-auto" width="100" height="100%" viewBox="0 0 100 2900" preserveAspectRatio="none">
                <path d="M 50 0 C 50 10, 80 20, 50 60 S 20 100, 50 140 S 80 180, 50 220 S 20 260, 50 300 S 80 340, 50 380 S 20 420, 50 460 S 80 500, 50 540 S 20 580, 50 620 S 80 660, 50 700 S 20 740, 50 780 S 80 820, 50 860 S 20 900, 50 940 S 80 980, 50 1020 S 20 1060, 50 1100 S 80 1140, 50 1180 S 20 1220, 50 1260 S 80 1300, 50 1340 S 20 1380, 50 1420 S 80 1460, 50 1500 S 20 1540, 50 1580 S 80 1620, 50 1660 S 20 1700, 50 1740 S 80 1780, 50 1820 S 20 1860, 50 1900 S 80 1940, 50 1980 S 20 2020, 50 2060 S 80 2100, 50 2140 S 20 2180, 50 2220 S 80 2260, 50 2300 S 20 2340, 50 2380 S 80 2420, 50 2460 S 20 2500, 50 2540 S 80 2580, 50 2620 S 20 2660, 50 2700 S 80 2740, 50 2780 S 20 2820, 50 2860 V 2880"
                fill="none" stroke="hsl(var(--border))" strokeWidth="4" strokeDasharray="8 8"/>
            </svg>

            <ul className="space-y-12 py-8 relative z-10">
                <TooltipProvider>
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isUnlocked = index === 0 || completedLessonIds.has(lessons[index-1]?.id);
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

export default LessonNavigation;
