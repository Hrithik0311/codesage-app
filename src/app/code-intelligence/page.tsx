import type { Metadata } from 'next';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import CodeIntelligenceClient from './CodeIntelligenceClient';

export const metadata: Metadata = {
  title: 'Code Intelligence Suite - CodeSage',
  description: 'Advanced static analysis, performance optimization, and automated refactoring tools for enterprise-grade code quality.',
};

export default function CodeIntelligencePage() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10">
        <CodeIntelligenceClient />
      </main>
    </>
  );
}
