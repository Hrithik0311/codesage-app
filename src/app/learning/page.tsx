
import type { Metadata } from 'next';
import LearningPageClient from './LearningPageClient';


export const metadata: Metadata = {
  title: 'FTC Java Programming Course - CodeSage Academy',
  description: 'Interactive lessons and resources for learning Java programming for FTC robotics, powered by CodeSage.',
};

export default function LearningPage() {
  return (
    <LearningPageClient />
  );
}
