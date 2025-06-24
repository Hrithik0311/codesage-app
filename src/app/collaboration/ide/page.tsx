
import type { Metadata } from 'next';
import IDEClient from './IDEClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Real-time Code Share - CodeSage',
  description: 'A shared workspace to view, edit, and discuss code with your team.',
};

export default function IDEPage() {
  return (
    <main className="relative z-10 flex h-screen w-screen items-start justify-center overflow-hidden">
      <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-background"><div className="loading-spinner"></div></div>}>
          <IDEClient />
      </Suspense>
    </main>
  );
}
