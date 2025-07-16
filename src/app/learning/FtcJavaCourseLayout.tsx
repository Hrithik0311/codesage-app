
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Lesson } from '@/data/ftc-java-lessons';
import LessonNavigation from '@/components/learning/LessonNavigation';
import LessonDisplay from '@/components/learning/LessonDisplay';
import { Zap, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/components/UserProfile';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseServices } from '@/lib/firebase';
import { ref as dbRef, get, push, serverTimestamp } from 'firebase/database';
import { sendNotificationEmail } from '@/ai/flows/send-notification-email';

const { database } = getFirebaseServices();

interface FtcJavaCourseLayoutProps {
  lessons: Lesson[];
  courseTitle?: string;
  nextCoursePath?: string;
}

const FtcJavaCourseLayout: React.FC<FtcJavaCourseLayoutProps> = ({ lessons, courseTitle = "FTC Java Course", nextCoursePath }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isInitialLessonSet, setIsInitialLessonSet] = useState(false);
  const { user, loading, updateLessonProgress, passedLessonIds, notificationSettings } = useAuth();
  const { toast } = useToast();
  const [teamCode, setTeamCode] = useState<string | null>(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
    if (user && database) {
        const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
        get(teamCodeRef).then((snapshot) => {
            if(snapshot.exists()) {
                setTeamCode(snapshot.val());
            }
        });
    }
  }, [user, loading, router]);

  const handleSelectLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
    // Setting the hash is a good way to keep the URL in sync and allow for deep linking.
    if (window.location.hash !== `#${lessonId}`) {
      router.replace(`${pathname}#${lessonId}`, { scroll: false });
    }
    const mainContent = document.getElementById('lesson-main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
    try {
        localStorage.setItem(`lastActiveLesson-${courseTitle}`, lessonId);
    } catch (error) {
        console.warn("Could not save lesson progress to localStorage:", error);
    }
  }, [pathname, router, courseTitle]);

  useEffect(() => {
    // This effect's only job is to determine the initial lesson to show when the course loads.
    // It is guarded by `isInitialLessonSet` to ensure it only runs once.
    if (isInitialLessonSet || loading || !user) {
      return;
    }

    // Priority 1: Check localStorage for the last viewed lesson.
    let lastViewedLessonId: string | null = null;
    try {
      lastViewedLessonId = localStorage.getItem(`lastActiveLesson-${courseTitle}`);
    } catch (error) {
      console.warn("Could not read from localStorage:", error);
    }

    if (lastViewedLessonId) {
      const lastViewedIndex = lessons.findIndex(l => l.id === lastViewedLessonId);
      if (lastViewedIndex !== -1) {
        // If the user passed the last lesson they were on, automatically advance them.
        if (passedLessonIds.has(lastViewedLessonId) && lastViewedIndex < lessons.length - 1) {
          const nextLesson = lessons[lastViewedIndex + 1];
          handleSelectLesson(nextLesson.id);
        } else {
          // Otherwise, take them back to the lesson they were viewing.
          handleSelectLesson(lastViewedLessonId);
        }
        setIsInitialLessonSet(true);
        return;
      }
    }
    
    // Priority 2: If no localStorage, find the first unpassed lesson.
    const firstUnpassedIndex = lessons.findIndex(l => !passedLessonIds.has(l.id));
    if (firstUnpassedIndex !== -1 && lessons[firstUnpassedIndex]) {
      handleSelectLesson(lessons[firstUnpassedIndex].id);
    } else if (lessons.length > 0) {
      // If all lessons are passed, just go to the last lesson of the course.
      handleSelectLesson(lessons[lessons.length - 1].id);
    }
    
    setIsInitialLessonSet(true);

  }, [lessons, courseTitle, passedLessonIds, handleSelectLesson, isInitialLessonSet, loading, user]);


  const handleLessonComplete = (lessonId: string, rawScore: number, totalQuestions: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const scoreToStore = lesson.type === 'test' ? rawScore : (totalQuestions > 0 ? rawScore / totalQuestions : 1);
    
    const wasAlreadyPassed = passedLessonIds.has(lessonId);
    
    updateLessonProgress(lessonId, scoreToStore);
    
    const PASS_THRESHOLD = 2 / 3;
    let isPassed;
    if (lesson.type === 'test' && lesson.passingScore) {
        isPassed = rawScore >= lesson.passingScore;
    } else {
        isPassed = scoreToStore >= PASS_THRESHOLD;
    }

    if (isPassed && !wasAlreadyPassed) {
        if (user && database) {
            if (teamCode) {
                const activitiesRef = dbRef(database, `teams/${teamCode}/activities`);
                push(activitiesRef, {
                    type: 'lesson_completion',
                    userId: user.uid,
                    userName: user.displayName || user.email,
                    details: {
                        lessonTitle: lesson.title,
                    },
                    timestamp: serverTimestamp(),
                });
            }
            if (notificationSettings.email && user.email) {
                 sendNotificationEmail({
                    to: user.email,
                    subject: `Lesson Complete: ${lesson.title}`,
                    body: `<h1>Progress Update!</h1><p>Congratulations! You have successfully completed the lesson: <strong>${lesson.title}</strong>.</p><p>Keep up the great work!</p>`
                }).catch(e => console.error("Failed to send lesson completion email:", e));
            }
       }
    }

    if (isPassed) {
       if (lesson.isFinalTestForCourse && nextCoursePath) {
            toast({
                title: "Course Complete!",
                description: `Congratulations! You've unlocked the next course.`,
            });
            router.push(nextCoursePath);
            return;
        }

      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        handleSelectLesson(nextLesson.id);
      } else if (currentIndex === lessons.length - 1) {
        toast({
            title: "Course Complete!",
            description: "Congratulations on finishing the course.",
        });
        router.push('/dashboard');
      }
    } else {
       toast({
          variant: "destructive",
          title: "Quiz Failed",
          description: lesson.type === 'test' && lesson.passingScore ? `You need to score at least ${lesson.passingScore} to pass. Please try again.` : `You need to score at least 67% to pass. Please try again.`,
       });
    }
  };

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
          
          <div className="hidden md:flex items-center gap-2">
            <BookOpen className="text-accent" size={24} />
            <h1 className="text-xl font-bold font-headline text-foreground">
              {courseTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <UserProfile />
          </div>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto px-2 sm:px-4 py-6 md:py-8 gap-4 md:gap-8">
        <LessonNavigation
          lessons={lessons}
          activeLessonId={activeLessonId}
          onSelectLesson={handleSelectLesson}
          passedLessonIds={passedLessonIds}
          courseTitle={courseTitle}
        />
        <main id="lesson-main-content" className="flex-1 bg-card/80 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl border border-border/50 overflow-y-auto max-h-[calc(100vh-12rem)] md:max-h-[calc(100vh-10rem)] scroll-smooth">
          {activeLesson ? (
            <LessonDisplay lesson={activeLesson} onLessonComplete={handleLessonComplete} isPassed={passedLessonIds.has(activeLesson.id)} />
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
