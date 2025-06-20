
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Lesson } from '@/data/ftc-java-lessons';
import LessonNavigation from './LessonNavigation';
import LessonDisplay from './LessonDisplay';
import { Zap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ThemeToggleButton'; // Added import

interface FtcJavaCourseLayoutProps {
  lessons: Lesson[];
}

const FtcJavaCourseLayout: React.FC<FtcJavaCourseLayoutProps> = ({ lessons }) => {
  const router = useRouter();
  const pathname = usePathname();
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
      } else if (lessons.length > 0 && !lessonIdFromHash) {
        setActiveLessonId(lessons[0].id);
        router.replace(`${pathname}#${lessons[0].id}`, { scroll: false });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [lessons, pathname, router]);

  const activeLesson = lessons.find(lesson => lesson.id === activeLessonId);

  return (
    <div className="flex flex-col min-h-screen bg-background/70 backdrop-blur-xl text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                <Zap size={20} />
            </div>
            <span className="text-xl font-headline font-bold">CodeSage</span>
            </Link>
          <div className="flex items-center gap-4"> {/* Increased gap */}
            <div className="flex items-center gap-2">
              <BookOpen className="text-accent" size={28}/>
              <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">
                FTC Java Programming
              </h1>
            </div>
            <ThemeToggleButton /> {/* Added theme toggle button */}
          </div>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto px-2 sm:px-4 py-6 md:py-8 gap-4 md:gap-8">
        <LessonNavigation
          lessons={lessons}
          activeLessonId={activeLessonId}
          onSelectLesson={handleSelectLesson}
        />
        <main id="lesson-main-content" className="flex-1 bg-card/80 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl border border-border/50 overflow-y-auto max-h-[calc(100vh-12rem)] md:max-h-[calc(100vh-10rem)] scroll-smooth">
          {activeLesson ? (
            <LessonDisplay lesson={activeLesson} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen size={64} className="text-primary mb-6 opacity-70" />
              <p className="text-2xl font-semibold text-foreground/90">Welcome to CodeSage Academy!</p>
              <p className="text-lg text-foreground/70 mt-2">Please select a lesson from the navigation panel to begin your learning journey.</p>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-background/90 backdrop-blur-lg mt-auto py-8 text-center border-t border-border/30">
        <p className="text-base text-foreground/70">
          &copy; {new Date().getFullYear()} CodeSage Academy. Empowering FTC Developers.
        </p>
      </footer>
    </div>
  );
};

export default FtcJavaCourseLayout;
