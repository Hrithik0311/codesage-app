
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Lesson } from '@/data/ftc-java-lessons';
import LessonNavigation from './LessonNavigation';
import LessonDisplay from './LessonDisplay';
import { Zap } from 'lucide-react';

interface FtcJavaCourseLayoutProps {
  lessons: Lesson[];
}

const FtcJavaCourseLayout: React.FC<FtcJavaCourseLayoutProps> = ({ lessons }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    const lessonIdFromHash = window.location.hash.substring(1);
    if (lessonIdFromHash && lessons.find(l => l.id === lessonIdFromHash)) {
      setActiveLessonId(lessonIdFromHash);
    } else if (lessons.length > 0) {
      setActiveLessonId(lessons[0].id);
      router.replace(`${pathname}#${lessons[0].id}`, { scroll: false });
    }
  }, [lessons, pathname, router]);

  const handleSelectLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
    router.replace(`${pathname}#${lessonId}`, { scroll: false });
    const mainContent = document.getElementById('lesson-main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
  }, [pathname, router]);

  useEffect(() => {
    const handleHashChange = () => {
      const lessonIdFromHash = window.location.hash.substring(1);
      if (lessonIdFromHash && lessons.find(l => l.id === lessonIdFromHash)) {
        setActiveLessonId(lessonIdFromHash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [lessons]);

  const activeLesson = lessons.find(lesson => lesson.id === activeLessonId);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
           <div className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                <Zap size={20} />
            </div>
            <span className="text-xl font-headline font-bold">CodeSage Academy</span>
            </div>
          <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">
            FTC Java Programming Course
          </h1>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto px-0 md:px-4 py-4 md:py-6 gap-0 md:gap-6">
        <LessonNavigation
          lessons={lessons}
          activeLessonId={activeLessonId}
          onSelectLesson={handleSelectLesson}
        />
        <main id="lesson-main-content" className="flex-1 bg-card p-4 md:p-8 rounded-lg shadow-lg overflow-y-auto max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-150px)]">
          {activeLesson ? (
            <LessonDisplay lesson={activeLesson} />
          ) : (
            <p>Select a lesson to begin.</p>
          )}
        </main>
      </div>

      <footer className="bg-background/80 backdrop-blur-md mt-auto py-6 text-center border-t border-border">
        <p className="text-sm text-foreground/70">
          &copy; {new Date().getFullYear()} CodeSage Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default FtcJavaCourseLayout;
