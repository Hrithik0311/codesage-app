'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

const signUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-3.56 0-6.47-2.92-6.47-6.5s2.91-6.5 6.47-6.5c2.03 0 3.37.82 4.14 1.56l2.69-2.6c-1.62-1.52-3.7-2.5-6.83-2.5-5.72 0-10.4 4.87-10.4 10.9s4.68 10.9 10.4 10.9c5.19 0 9.55-3.63 9.55-9.82 0-.64-.07-1.25-.16-1.84z" fill="currentColor"/>
  </svg>
);

export default function AuthClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [authState, setAuthState] = useState<'checkingRedirect' | 'submitting' | 'idle'>('checkingRedirect');

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  const showFirebaseNotConfiguredToast = () => {
    toast({
      title: 'Configuration Error',
      description: 'Firebase is not configured. Please check your setup.',
      variant: 'destructive',
    });
  };

  const handleAuthSuccess = (userCredential: UserCredential) => {
    toast({ title: 'Success!', description: `Welcome, ${userCredential.user.email}` });
    router.push('/dashboard');
  };

  const handleAuthError = (error: any) => {
     if (error.code === 'auth/no-redirect-operation') {
        return;
    }
    toast({
      title: 'Authentication Failed',
      description: error.message || 'An unexpected error occurred.',
      variant: 'destructive',
    });
  };

  useEffect(() => {
    const checkRedirectResult = async () => {
      if (!auth) {
        setAuthState('idle');
        return;
      }
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          handleAuthSuccess(result);
        }
      } catch (error) {
        handleAuthError(error);
      } finally {
        setAuthState('idle');
      }
    };

    checkRedirectResult();
  }, []);

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    if (!auth) {
      showFirebaseNotConfiguredToast();
      return;
    }
    setAuthState('submitting');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      handleAuthSuccess(userCredential);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setAuthState('idle');
    }
  };

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    if (!auth) {
      showFirebaseNotConfiguredToast();
      return;
    }
    setAuthState('submitting');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      handleAuthSuccess(userCredential);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setAuthState('idle');
    }
  };

  const onGoogleSignIn = async () => {
    if (!auth) {
      showFirebaseNotConfiguredToast();
      return;
    }
    setAuthState('submitting');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      handleAuthError(error);
      setAuthState('idle');
    }
  };

  const isLoading = authState !== 'idle';

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center gap-3 text-foreground mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                <ShieldCheck size={28} />
            </div>
            <span className="text-3xl font-headline font-bold">CodeSage</span>
        </Link>
        <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in or create an account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 mt-4">
                <FormField control={loginForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={loginForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isLoading}>{authState === 'submitting' ? 'Signing In...' : 'Sign In'}</Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup">
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4 mt-4">
                <FormField control={signUpForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={signUpForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isLoading}>{authState === 'submitting' ? 'Creating Account...' : 'Create Account'}</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={isLoading}>
          <GoogleIcon /> Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
