
import type { Metadata } from 'next';
import IntermediateLearningPageClient from './IntermediateLearningPageClient';


export const metadata: Metadata = {
  title: 'Intermediate FTC Java - CodeSage Academy',
  description: 'Advanced lessons for FTC robotics, powered by CodeSage.',
};

export default function IntermediateLearningPage() {
  return (
    <div className="relative z-10 min-h-screen">
      <IntermediateLearningPageClient />
    </div>
  );
}
