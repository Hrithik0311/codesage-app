
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Lesson } from '@/data/ftc-java-lessons';
import LessonDisplay from '@/components/learning/LessonDisplay';
import { Zap, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/components/UserProfile';
import { NotificationBell } from '@/components/NotificationBell';
import LessonPath from '@/components/learning/LessonPath';
import { useToast } from '@/hooks/use-toast';

interface FtcJavaCourseLayoutProps {
  lessons: Lesson[];
}

const FtcJavaCourseLayout: React.FC<FtcJavaCourseLayoutProps> = ({ lessons }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const { user, loading } = useAuth();
  
  // Mock user progress. In a real app, this would come from a database.
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showPlacementResult, setShowPlacementResult] = useState(false);
  const [placementScore, setPlacementScore] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleSelectLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
    router.replace(`${pathname}#${lessonId}`, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    const lessonIdFromHash = window.location.hash.substring(1);
    if (lessonIdFromHash && lessons.find(l => l.id === lessonIdFromHash)) {
      handleSelectLesson(lessonIdFromHash);
    } else if (lessons.length > 0) {
      handleSelectLesson(lessons[0].id);
    }
  }, [lessons, handleSelectLesson]);


  const handleLessonComplete = (lessonId: string, score?: number, total?: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    setCompletedIds(prev => new Set(prev).add(lessonId));
    
    if (lesson.type === 'placement' && score !== undefined && total !== undefined) {
        const percentage = (score / total) * 100;
        setPlacementScore(percentage);
        
        let lessonsToUnlock = 0;
        if (percentage >= 80) lessonsToUnlock = 4;
        else if (percentage >= 50) lessonsToUnlock = 2;

        const unlockedIds = lessons
            .filter(l => l.type === 'lesson')
            .slice(0, lessonsToUnlock)
            .map(l => l.id);

        setCompletedIds(prev => new Set([...prev, ...unlockedIds]));
        setShowPlacementResult(true);
        toast({
          title: "Placement Test Complete!",
          description: `Great job! You've unlocked ${lessonsToUnlock + 1} lessons based on your score.`,
        });
    } else {
       toast({
          title: "Lesson Complete!",
          description: `Great work on finishing "${lesson.title}".`,
        });
    }
  };

  const handleNavigateToNextLesson = (currentLessonId: string) => {
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) {
        handleSelectLesson(nextLesson.id);
    }
  }


  const activeLesson = lessons.find(lesson => lesson.id === activeLessonId);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/70 backdrop-blur-xl text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
              <Zap size={20} />
            </div>
            <span className="text-xl font-headline font-bold">CodeSage</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="text-accent" size={28} />
              <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">
                FTC Java Course
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggleButton />
              <NotificationBell />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto px-2 sm:px-4 py-6 md:py-8 gap-4 md:gap-8">
        <LessonPath
          lessons={lessons}
          activeLessonId={activeLessonId}
          completedLessonIds={completedIds}
          onSelectLesson={handleSelectLesson}
        />
        <main id="lesson-main-content" className="flex-1 bg-card/80 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl border border-border/50 overflow-y-auto max-h-[calc(100vh-12rem)] md:max-h-[calc(100vh-10rem)] scroll-smooth">
          {activeLesson ? (
            <LessonDisplay 
              lesson={activeLesson} 
              onComplete={(score, total) => handleLessonComplete(activeLesson.id, score, total)}
              onContinue={() => handleNavigateToNextLesson(activeLesson.id)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Trophy size={64} className="text-primary mb-6 opacity-70" />
              <p className="text-2xl font-semibold text-foreground/90">Welcome to CodeSage Academy!</p>
              <p className="text-lg text-foreground/70 mt-2">Select a lesson from the path to begin your learning journey.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FtcJavaCourseLayout;
