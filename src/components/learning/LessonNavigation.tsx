
"use client";

import React from 'react';
import type { Lesson } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LessonNavigationProps {
  lessons: Lesson[];
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  lessons,
  activeLessonId,
  onSelectLesson,
}) => {
  return (
    <nav className="w-full md:w-72 bg-card md:bg-card/50 p-2 md:p-4 rounded-lg shadow-md md:sticky md:top-[calc(theme(spacing.16)_+_theme(spacing.6)_)] max-h-[30vh] md:max-h-[calc(100vh-150px)] mb-4 md:mb-0">
       <h2 className="text-lg font-semibold font-headline text-foreground mb-3 p-2">Lessons</h2>
      <ScrollArea className="h-[calc(30vh-4rem)] md:h-[calc(100%-4rem)] pr-3">
        <ul className="space-y-1">
          {lessons.map(lesson => (
            <li key={lesson.id}>
              <Button
                variant="ghost"
                onClick={() => onSelectLesson(lesson.id)}
                className={cn(
                  "w-full justify-start text-left h-auto py-2 px-3 font-medium",
                  lesson.id === activeLessonId
                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                    : 'text-foreground/80 hover:bg-accent/10 hover:text-accent-foreground'
                )}
              >
                {lesson.title}
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );
};

export default LessonNavigation;
