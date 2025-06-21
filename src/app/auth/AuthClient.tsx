'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AuthClient() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    if (!auth) {
      console.error("Firebase auth is not configured.");
      toast({
        title: 'Configuration Error',
        description: 'Firebase is not configured. Please check your setup.',
        variant: 'destructive',
      });
      return;
    }
    
    const provider = new GoogleAuthProvider();

    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      toast({
        title: 'Success!',
        description: `Welcome, ${result.user.email}`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Sign-In Failed:", error);

      if (error.code === 'auth/unauthorized-domain') {
        toast({
            title: 'Authentication Error',
            description: "This app's domain is not authorized for OAuth operations. Please check your Firebase and Google Cloud console settings.",
            variant: 'destructive',
            duration: 9000,
        });
      } else {
         toast({
            title: 'Authentication Failed',
            description: error.message,
            variant: 'destructive',
         });
      }
    }
  };

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Welcome</CardTitle>
        <CardDescription>Sign in to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGoogleSignIn} className="w-full">
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
