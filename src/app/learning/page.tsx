
import type { Metadata } from 'next';
import FtcJavaCourseLayout from '@/components/learning/FtcJavaCourseLayout';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import AnimatedBackground from '@/components/landing/AnimatedBackground';


export const metadata: Metadata = {
  title: 'FTC Java Programming Course - CodeSage',
  description: 'Interactive lessons for learning Java programming for FTC robotics.',
};

export default function LearningPage() {
  return (
    <>
      <AnimatedBackground /> 
      <div className="relative z-10">
        <FtcJavaCourseLayout lessons={ftcJavaLessons} />
      </div>
    </>
  );
}
