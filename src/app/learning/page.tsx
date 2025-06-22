
import type { Metadata } from 'next';
import FtcJavaCourseLayout from '@/app/learning/FtcJavaCourseLayout';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import AnimatedBackground from '@/components/landing/AnimatedBackground';


export const metadata: Metadata = {
  title: 'FTC Java Programming Course - CodeSage Academy',
  description: 'Interactive lessons and resources for learning Java programming for FTC robotics, powered by CodeSage.',
};

export default function LearningPage() {
  return (
    <>
      <AnimatedBackground /> 
      <div className="relative z-10 min-h-screen">
        <FtcJavaCourseLayout lessons={ftcJavaLessons} />
      </div>
    </>
  );
}
