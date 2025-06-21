
import type { Metadata } from 'next';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import CollaborationClient from './CollaborationClient';

export const metadata: Metadata = {
  title: 'Team Collaboration Hub - CodeSage',
  description: 'Real-time collaborative IDE, version control, and deployment pipelines for your team.',
};

export default function CollaborationPage() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10">
        <CollaborationClient />
      </main>
    </>
  );
}
