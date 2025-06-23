
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, BookOpen, Search, Users, Trophy, GitCommit, BarChart, ArrowRight, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/UserProfile';
import { NotificationBell } from '@/components/NotificationBell';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';
import { database } from '@/lib/firebase';
import { ref as dbRef, get, query, limitToLast, onValue, orderByChild } from 'firebase/database';
import { formatDistanceToNowStrict } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const FeatureCard = ({ href, icon: Icon, title, description, buttonText }) => (
  <Link href={href} passHref>
    <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50 h-full flex flex-col group hover:border-accent/70 hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform duration-300">
            <Icon size={24} />
          </div>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
          {buttonText} <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardFooter>
    </Card>
  </Link>
);


const ProgressItem = ({ icon: Icon, label, value, total, unit, indicatorClassName }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            <span className="font-bold text-foreground">{value} {total ? `/ ${total}` : ''} {unit}</span>
        </div>
        {total != null && (
             <Progress value={total > 0 ? (value / total) * 100 : 0} className="h-2" indicatorClassName={indicatorClassName} />
        )}
    </div>
);

const ActivityItem = ({ activity }) => {
    const { type, userName, details, timestamp, userId } = activity;
    const { user } = useAuth();
    const isYou = user?.uid === userId;

    let icon = GitCommit;
    let text;

    switch (type) {
        case 'commit':
            icon = GitCommit;
            text = <p className="font-medium">
                <span className="font-bold">{isYou ? 'You' : userName}</span> committed '{details.message}'
            </p>;
            break;
        case 'lesson_completion':
            icon = BookOpen;
            text = <p className="font-medium">
                <span className="font-bold">{isYou ? 'You' : userName}</span> completed '{details.lessonTitle}'
            </p>;
            break;
        case 'analysis':
            icon = Search;
            text = <p className="font-medium">
                <span className="font-bold">{isYou ? 'You' : userName}</span> ran an analysis on {details.fileName}
            </p>;
            break;
        default:
            icon = GitCommit;
            text = <p className="font-medium">An unknown activity occurred.</p>
    }

    const IconComponent = icon;

    return (
        <li className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4 overflow-hidden">
                <IconComponent className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="truncate">{text}</div>
            </div>
            <span className="text-sm text-muted-foreground flex-shrink-0">
                {timestamp ? formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true }) : 'just now'}
            </span>
        </li>
    );
};


export default function DashboardClient() {
  const { user, loading, passedLessonIds } = useAuth();
  const router = useRouter();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      if (user && database) {
          setIsActivitiesLoading(true);
          const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
          get(teamCodeRef).then((snapshot) => {
              if (snapshot.exists()) {
                  const teamCode = snapshot.val();
                  const activitiesRef = dbRef(database, `teams/${teamCode}/activities`);
                  const activitiesQuery = query(activitiesRef, orderByChild('timestamp'), limitToLast(5));
                  
                  const unsubscribe = onValue(activitiesQuery, (activitiesSnapshot) => {
                      const activitiesData: any[] = [];
                      activitiesSnapshot.forEach((child) => {
                          activitiesData.push({ id: child.key, ...child.val() });
                      });
                      setRecentActivities(activitiesData.reverse()); // newest first
                      setIsActivitiesLoading(false);
                  });
                  return unsubscribe;
              } else {
                  setIsActivitiesLoading(false); // No team, no activities
                  setRecentActivities([]);
              }
          }).catch(() => setIsActivitiesLoading(false));
      } else if (!loading) {
          setIsActivitiesLoading(false); // Not logged in
      }
  }, [user, loading]);

  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="loading-spinner"></div>
        </div>
    );
  }

  const beginnerLessonIds = new Set(ftcJavaLessons.map(l => l.id));
  const intermediateLessonIds = new Set(ftcJavaLessonsIntermediate.map(l => l.id));
  const advancedLessonIds = new Set(ftcJavaLessonsAdvanced.map(l => l.id));

  const beginnerCompleted = [...passedLessonIds].filter(id => beginnerLessonIds.has(id)).length;
  const intermediateCompleted = [...passedLessonIds].filter(id => intermediateLessonIds.has(id)).length;
  const advancedCompleted = [...passedLessonIds].filter(id => advancedLessonIds.has(id)).length;

  const totalBeginner = ftcJavaLessons.length;
  const totalIntermediate = ftcJavaLessonsIntermediate.length;
  const totalAdvanced = ftcJavaLessonsAdvanced.length;


  return (
    <div className="w-full flex flex-col items-center min-h-screen">
        <header className="w-full max-w-7xl mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                    <ShieldCheck size={20} />
                </div>
                <span className="text-xl font-headline font-bold">CodeSage</span>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserProfile />
            </div>
        </header>

        <main className="w-full max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 flex-grow">
          <section className="mb-12 animate-fade-in-up-hero">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              Welcome back, <span className="gradient-text hero-title-gradient">{user.displayName || user.email?.split('@')[0]}!</span>
            </h1>
            <p className="text-foreground/80 mt-4 max-w-2xl text-lg">
              This is your mission control. Let's build something amazing today.
            </p>
          </section>

          <div className="space-y-8">
            <section>
                <h2 className="font-headline text-2xl font-bold mb-6">Core Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard
                        href="/learning"
                        icon={BookOpen}
                        title="Interactive Tutorials"
                        description="Learn Java for FTC with hands-on lessons and quizzes."
                        buttonText="Go to Lessons"
                    />
                    <FeatureCard
                        href="/code-intelligence"
                        icon={Search}
                        title="AI Code Assistant"
                        description="Analyze, refactor, and improve your robot code."
                        buttonText="Analyze Code"
                    />
                     <FeatureCard
                        href="/collaboration"
                        icon={Users}
                        title="Cloud IDE & Team Hub"
                        description="Collaborate in real-time and manage your code."
                        buttonText="Open Team Hub"
                    />
                </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="font-headline text-2xl font-bold mb-6">Recent Team Activity</h2>
                        <Card className="bg-card/80 backdrop-blur-md shadow-lg border-border/50">
                            <CardContent className="p-0">
                                <ul className="divide-y divide-border/50">
                                    {isActivitiesLoading ? (
                                        [...Array(4)].map((_, i) => (
                                            <li key={i} className="flex items-center gap-4 px-6 py-4">
                                                <Skeleton className="w-5 h-5 rounded-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </li>
                                        ))
                                    ) : recentActivities.length > 0 ? (
                                        recentActivities.map((activity) => (
                                            <ActivityItem key={activity.id} activity={activity} />
                                        ))
                                    ) : (
                                        <li className="px-6 py-8 text-center text-muted-foreground">No recent team activity.</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    <section>
                        <h2 className="font-headline text-2xl font-bold mb-6">Course Completion</h2>
                        <Card className="bg-card/80 backdrop-blur-md shadow-lg border-border/50">
                            <CardContent className="p-6 space-y-6">
                               <ProgressItem icon={Trophy} label="Beginner" value={beginnerCompleted} total={totalBeginner} unit="" indicatorClassName="bg-green-500" />
                               <ProgressItem icon={Trophy} label="Intermediate" value={intermediateCompleted} total={totalIntermediate} unit="" indicatorClassName="bg-blue-500" />
                               <ProgressItem icon={Trophy} label="Advanced" value={advancedCompleted} total={totalAdvanced} unit="" indicatorClassName="bg-purple-500" />
                            </CardContent>
                        </Card>
                    </section>
                     <section>
                         <h2 className="font-headline text-2xl font-bold mb-6">Activity Stats</h2>
                         <Card className="bg-card/80 backdrop-blur-md shadow-lg border-border/50">
                             <CardContent className="p-6 space-y-6">
                                <ProgressItem icon={GitCommit} label="Team Commits" value={12} unit="commits" />
                                <ProgressItem icon={BarChart} label="Analyses Run" value={8} unit="analyses" />
                             </CardContent>
                         </Card>
                     </section>
                     <section>
                        <h2 className="font-headline text-2xl font-bold mb-6">Quick Tip</h2>
                        <Card className="bg-card/80 backdrop-blur-md shadow-lg border-border/50">
                            <CardContent className="p-6 flex items-start gap-4">
                                <Lightbulb className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-card-foreground mb-1">Use 'final' for variables</p>
                                    <p className="text-muted-foreground text-sm">In Java, declaring a variable with `final` prevents it from being changed. It's a good practice for configuration values like motor names.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
          </div>
        </main>
    </div>
  );
}
