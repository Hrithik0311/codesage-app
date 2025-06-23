
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import FtcJavaCourseLayout from '@/app/learning/FtcJavaCourseLayout';

export default function IntermediateLearningPageClient() {
  const { user, loading, passedLessonIds } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (passedLessonIds.has('intermediate-final-test')) {
        router.replace('/learning/advanced');
      } else if (!passedLessonIds.has('final-course-test')) {
        // If for some reason user got here without passing beginner course, send them back
        router.replace('/learning');
      }
    }
  }, [loading, passedLessonIds, router]);

  if (loading || !user || (!loading && !passedLessonIds.has('final-course-test'))) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background/70 backdrop-blur-xl">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Show intermediate course
  return (
    <div className="relative z-10 min-h-screen">
      <FtcJavaCourseLayout lessons={ftcJavaLessonsIntermediate} courseTitle="Intermediate FTC Java" nextCoursePath="/learning/advanced" />
    </div>
  );
}
