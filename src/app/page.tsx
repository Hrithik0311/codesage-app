import HomePageClient from '@/components/landing/HomePageClient';
import AnimatedBackground from '@/components/landing/AnimatedBackground';

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10">
        <HomePageClient />
      </main>
    </>
  );
}
