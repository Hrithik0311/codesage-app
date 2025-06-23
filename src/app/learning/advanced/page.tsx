
import type { Metadata } from 'next';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import AdvancedLearningPageClient from './AdvancedLearningPageClient';


export const metadata: Metadata = {
  title: 'Advanced FTC Concepts - CodeSage Academy',
  description: 'Expert-level lessons for FTC robotics, powered by CodeSage.',
};

export default function AdvancedLearningPage() {
  return (
    <>
      <AnimatedBackground /> 
      <div className="relative z-10 min-h-screen">
        <AdvancedLearningPageClient />
      </div>
    </>
  );
}
