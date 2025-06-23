
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';
import FtcJavaCourseLayout from '@/app/learning/FtcJavaCourseLayout';

export default function AdvancedLearningPageClient() {
  const { user, loading, passedLessonIds } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth');
      } else if (!passedLessonIds.has('intermediate-final-test')) {
        // If they haven't passed the intermediate course, they can't be here.
        // Check if they passed the beginner course to decide where to send them.
        if (passedLessonIds.has('final-course-test')) {
          router.replace('/learning/intermediate');
        } else {
          router.replace('/learning');
        }
      }
    }
  }, [loading, user, passedLessonIds, router]);

  // While loading or redirecting, show a spinner.
  if (loading || !user || !passedLessonIds.has('intermediate-final-test')) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background/70 backdrop-blur-xl">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If checks pass, render the advanced course.
  return (
    <div className="relative z-10 min-h-screen">
      <FtcJavaCourseLayout lessons={ftcJavaLessonsAdvanced} courseTitle="Advanced FTC Concepts" />
    </div>
  );
}
