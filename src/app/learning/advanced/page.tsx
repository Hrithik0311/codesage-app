
import type { Metadata } from 'next';
import FtcJavaCourseLayout from '@/app/learning/FtcJavaCourseLayout';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';
import AnimatedBackground from '@/components/landing/AnimatedBackground';


export const metadata: Metadata = {
  title: 'Advanced FTC Concepts - CodeSage Academy',
  description: 'Expert-level lessons for FTC robotics, powered by CodeSage.',
};

export default function AdvancedLearningPage() {
  return (
    <>
      <AnimatedBackground /> 
      <div className="relative z-10 min-h-screen">
        <FtcJavaCourseLayout lessons={ftcJavaLessonsAdvanced} courseTitle="Advanced FTC Concepts" />
      </div>
    </>
  );
}
