
import type { Metadata } from 'next';
import IDEClient from './IDEClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Live IDE - CodeSage',
  description: 'A full-featured, real-time collaborative IDE for your team.',
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
