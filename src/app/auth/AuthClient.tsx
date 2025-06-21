'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function AuthClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isProcessingLogin, setIsProcessingLogin] = useState(true);

  useEffect(() => {
    const processRedirect = async () => {
      if (!auth) {
        setIsProcessingLogin(false);
        return;
      }
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast({
            title: 'Success!',
            description: `Welcome, ${result.user.email}`,
          });
          // The useAuth hook will handle the redirect to dashboard
        }
      } catch (error: any) {
        console.error("Google Sign-In Failed After Redirect:", error);
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
      } finally {
        setIsProcessingLogin(false);
      }
    };

    processRedirect();
  }, [toast]);
  
  useEffect(() => {
    if (!authLoading && user) {
        router.push('/dashboard');
    }
  }, [user, authLoading, router]);


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
    setIsProcessingLogin(true);
    // signInWithRedirect will navigate away, errors are caught by getRedirectResult
    await signInWithRedirect(auth, provider);
  };

  const isLoading = authLoading || isProcessingLogin;

  if (isLoading) {
    return (
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Signing In</CardTitle>
                <CardDescription>Please wait...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-8">
                <div className="loading-spinner"></div>
            </CardContent>
        </Card>
    );
  }

  if (user) return null; // We are about to redirect

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Welcome</CardTitle>
        <CardDescription>Sign in to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGoogleSignIn} className="w-full" disabled={isLoading}>
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
