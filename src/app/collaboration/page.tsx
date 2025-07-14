
import type { Metadata } from 'next';
import CollaborationClient from './CollaborationClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Team Collaboration Hub - CodeSage',
  description: 'Real-time collaborative IDE, version control, and deployment pipelines for your team.',
};

export default function CollaborationPage() {
  return (
    <main className="relative z-10">
      <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center bg-background"><div className="loading-spinner"></div></div>}>
        <CollaborationClient />
      </Suspense>
    </main>
  );
}
