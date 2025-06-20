
"use client";

import React from 'react';
import type { Lesson } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BookMarked } from 'lucide-react';

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
    <nav className="w-full md:w-80 bg-card/70 backdrop-blur-md p-3 md:p-5 rounded-xl shadow-xl border border-border/30 md:sticky md:top-[calc(theme(spacing.4)_+_6rem)] max-h-[40vh] md:max-h-[calc(100vh-12rem)] mb-4 md:mb-0 flex flex-col">
       <h2 className="text-xl font-semibold font-headline text-foreground mb-4 p-2 flex items-center gap-2 border-b border-border/50 pb-3">
         <BookMarked className="text-primary" size={24} />
         Course Lessons
       </h2>
      <ScrollArea className="flex-grow pr-2">
        <ul className="space-y-1.5">
          {lessons.map(lesson => (
            <li key={lesson.id}>
              <Button
                variant="ghost"
                onClick={() => onSelectLesson(lesson.id)}
                className={cn(
                  "w-full justify-start text-left h-auto py-2.5 px-3 font-medium text-base transition-all duration-200 ease-in-out transform hover:scale-[1.02]",
                  lesson.id === activeLessonId
                    ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                    : 'text-foreground/80 hover:bg-accent/20 hover:text-accent-foreground'
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
