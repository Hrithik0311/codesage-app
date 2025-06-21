'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function AuthClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isProcessingAuth, setIsProcessingAuth] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const processRedirect = async () => {
      if (!auth) {
        setIsProcessingAuth(false);
        return;
      }
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast({
            title: 'Success!',
            description: `Welcome, ${result.user.email}`,
          });
        }
      } catch (error: any) {
        console.error('Google Sign-In Failed After Redirect:', error);
        handleAuthError(error);
      } finally {
        setIsProcessingAuth(false);
      }
    };

    processRedirect();
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleAuthError = (error: any) => {
    console.error('Authentication Error:', error);
    let description = error.message;
    if (error.code === 'auth/email-already-in-use') {
      description = 'This email is already in use. Please try signing in.';
    } else if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      description = 'Invalid email or password. Please try again.';
    } else if (error.code === 'auth/unauthorized-domain') {
      description =
        "This app's domain is not authorized for OAuth operations. Please check your Firebase console settings.";
    }
    toast({
      title: 'Authentication Failed',
      description,
      variant: 'destructive',
    });
  };

  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setIsProcessingAuth(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleSignUp = async (values: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setIsProcessingAuth(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    setIsProcessingAuth(true);
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      handleAuthError(error);
      setIsProcessingAuth(false);
    }
  };

  const isLoading = authLoading || isProcessingAuth;

  if (isLoading && !form.formState.isSubmitting) {
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

  if (user) return null;

  const EmailPasswordForm = ({ isSignUp = false }: { isSignUp?: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(isSignUp ? handleSignUp : handleSignIn)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );

  return (
    <Card className="w-full max-w-sm bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Welcome</CardTitle>
        <CardDescription>Sign in or create an account to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="pt-4">
            <EmailPasswordForm />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <EmailPasswordForm isSignUp />
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={isLoading}>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2C322.3 119.3 286.5 96 248 96c-88.8 0-160 72.2-160 160s71.2 160 160 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"
            ></path>
          </svg>
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}