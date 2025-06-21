import type { Metadata } from 'next';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import DashboardClient from './DashboardClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard - CodeSage',
  description: 'Your personal CodeSage dashboard.',
};

export default function DashboardPage() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10 flex min-h-screen items-start justify-center p-4 sm:p-8 md:p-12">
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardClient />
        </Suspense>
      </main>
    </>
  );
}
