
"use client";

import React from 'react';
import type { Lesson } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BookOpen, Check, ClipboardList, Lock, Rocket, RotateCcw, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


interface LessonNavigationProps {
  lessons: Lesson[];
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  completedLessonIds: Set<string>;
  onResetProgress: () => void;
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
  onResetProgress,
}) => {
  const handleReset = () => {
    onResetProgress();
    if (lessons.length > 0) {
      onSelectLesson(lessons[0].id);
    }
  };

  return (
    <nav className="w-full md:w-80 bg-card/70 backdrop-blur-md p-3 md:p-5 rounded-xl shadow-xl border border-border/30 md:sticky md:top-[calc(theme(spacing.4)_+_6rem)] max-h-[40vh] md:max-h-[calc(100vh-12rem)] mb-4 md:mb-0 flex flex-col">
       <h2 className="text-xl font-semibold font-headline text-foreground mb-4 p-2 flex items-center gap-2 border-b border-border/50 pb-3">
         <Rocket className="text-primary" size={24} />
         Learning Path
       </h2>
      <ScrollArea className="flex-grow pr-2">
        <div className="relative w-full pl-4 py-4">
          <div className="absolute top-10 bottom-10 left-[23px] w-0.5 bg-border -z-10" />
            <ul className="space-y-6 relative z-10">
                <TooltipProvider>
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isUnlocked = index === 0 || (lessons[index-1] && completedLessonIds.has(lessons[index-1].id));
                    const isActive = lesson.id === activeLessonId;
                    const Icon = getIconForLesson(lesson.type);

                    const nodeStateClasses = {
                        completed: "bg-green-500 border-green-400 text-white shadow-green-500/40",
                        active: "bg-accent border-accent-foreground text-accent-foreground shadow-accent/40",
                        unlocked: "bg-primary border-primary/80 text-primary-foreground shadow-primary/40",
                        locked: "bg-muted border-border text-muted-foreground shadow-sm",
                    };

                    let state: keyof typeof nodeStateClasses = 'locked';
                    if (isCompleted) state = 'completed';
                    else if (isActive) state = 'active';
                    else if (isUnlocked) state = 'unlocked';
                    
                    return (
                        <li key={lesson.id} className="flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        disabled={!isUnlocked}
                                        onClick={() => onSelectLesson(lesson.id)}
                                        className={cn(
                                            "rounded-full flex flex-col items-center justify-center p-2 transition-all duration-300 transform hover:scale-110 shadow-lg border-4",
                                            nodeStateClasses[state],
                                            !isUnlocked && "cursor-not-allowed",
                                            isActive ? "w-16 h-16" : "w-12 h-12"
                                        )}
                                    >
                                        {isCompleted ? <Check size={isActive ? 30 : 22} /> : !isUnlocked ? <Lock size={isActive ? 26 : 20} /> : <Icon size={isActive ? 26 : 20} />}
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
      <div className="mt-auto pt-4 border-t border-border/30">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Progress
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently reset your lesson progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, reset my progress
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </nav>
  );
};

export default LessonNavigation;
