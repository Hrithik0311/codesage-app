
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, BookOpen, Search, Users, Trophy, GitCommit, BarChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/UserProfile';

const FeatureCard = ({ href, icon: Icon, title, description, buttonText }) => (
  <Link href={href} passHref>
    <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 h-full flex flex-col group hover:border-accent/70 hover:-translate-y-2 transition-all duration-300">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform duration-300">
            <Icon size={32} />
          </div>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
          {buttonText} <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardFooter>
    </Card>
  </Link>
);


export default function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center min-h-screen">
        <header className="w-full max-w-6xl mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                    <ShieldCheck size={20} />
                </div>
                <span className="text-xl font-headline font-bold">CodeSage</span>
            </Link>
            <UserProfile />
        </header>

        <main className="w-full max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-6 flex-grow">
          <section className="text-center mb-16 animate-fade-in-up-hero">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              Welcome back, <span className="gradient-text hero-title-gradient">{user.displayName || user.email?.split('@')[0]}!</span>
            </h1>
            <p className="text-foreground/80 mt-4 max-w-2xl mx-auto text-lg">
              This is your mission control. Pick up where you left off or explore a new feature.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              href="/learning"
              icon={BookOpen}
              title="Interactive Tutorials"
              description="Learn Java for FTC with hands-on lessons and quizzes."
              buttonText="Start Learning"
            />
            <FeatureCard
              href="/code-intelligence"
              icon={Search}
              title="AI Code Assistant"
              description="Analyze, refactor, and improve your code with AI."
              buttonText="Analyze Code"
            />
            <FeatureCard
              href="/collaboration"
              icon={Users}
              title="Cloud IDE & Team Hub"
              description="Collaborate in real-time and manage your team's code."
              buttonText="Open Team Hub"
            />
          </section>

          <section>
            <h2 className="font-headline text-3xl font-bold text-center mb-8 gradient-text bg-gradient-to-r from-foreground to-foreground/70">Your Progress</h2>
            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
              <CardContent className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Trophy size={40} className="text-accent" />
                  <p className="text-2xl font-semibold">5 / 10</p>
                  <p className="text-muted-foreground">Lessons Completed</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <GitCommit size={40} className="text-accent" />
                  <p className="text-2xl font-semibold">12</p>
                  <p className="text-muted-foreground">Team Commits</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <BarChart size={40} className="text-accent" />
                  <p className="text-2xl font-semibold">8</p>
                  <p className="text-muted-foreground">Code Analyses Run</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
    </div>
  );
}
