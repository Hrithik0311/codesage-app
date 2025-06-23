
import type { Metadata } from 'next';
import FtcJavaCourseLayout from '@/app/learning/FtcJavaCourseLayout';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import AnimatedBackground from '@/components/landing/AnimatedBackground';


export const metadata: Metadata = {
  title: 'Intermediate FTC Java - CodeSage Academy',
  description: 'Advanced lessons for FTC robotics, powered by CodeSage.',
};

export default function IntermediateLearningPage() {
  return (
    <>
      <AnimatedBackground /> 
      <div className="relative z-10 min-h-screen">
        <FtcJavaCourseLayout lessons={ftcJavaLessonsIntermediate} courseTitle="Intermediate FTC Java" />
      </div>
    </>
  );
}
