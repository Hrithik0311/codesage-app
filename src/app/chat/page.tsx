
import type { Metadata } from 'next';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import ChatClient from './ChatClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Team Chat - CodeSage',
  description: 'Communicate with your team in real-time.',
};

export default function ChatPage() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10 flex min-h-screen items-start justify-center">
        <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center bg-background"><div className="loading-spinner"></div></div>}>
            <ChatClient />
        </Suspense>
      </main>
    </>
  );
}
