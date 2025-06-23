
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import FtcJavaCourseLayout from '@/app/learning/FtcJavaCourseLayout';

export default function LearningPageClient() {
  const { loading, passedLessonIds } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (passedLessonIds.has('final-course-test')) {
        router.replace('/learning/intermediate');
      }
    }
  }, [loading, passedLessonIds, router]);

  // While loading auth state, or if we know we are about to redirect,
  // show a loading spinner to prevent the beginner course from flashing.
  if (loading || (!loading && passedLessonIds.has('final-course-test'))) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background/70 backdrop-blur-xl">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Otherwise, show the beginner course.
  return (
    <div className="relative z-10 min-h-screen">
      <FtcJavaCourseLayout lessons={ftcJavaLessons} courseTitle="FTC Java Course" />
    </div>
  );
}
