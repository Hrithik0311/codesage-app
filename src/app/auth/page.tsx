import type { Metadata } from 'next';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import AuthClient from './AuthClient';

export const metadata: Metadata = {
  title: 'Login / Sign Up - CodeSage',
  description: 'Access your CodeSage account or create a new one.',
};

export default function AuthPage() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <AuthClient />
      </main>
    </>
  );
}
