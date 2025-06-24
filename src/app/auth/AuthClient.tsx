
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email.' }),
  password: z.string().min(1, { message: 'Password required.' }),
});

const signUpSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Enter a valid email.' }),
  password: z.string().min(6, { message: 'Minimum 6 characters.' }),
});

export default function AuthClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleAuthError = (error: any) => {
    console.error('Auth Error:', error);
    let msg = 'Unexpected error. Try again.';
    switch (error.code) {
      case 'auth/email-already-in-use':
        msg = 'Email already in use.';
        break;
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        msg = 'Invalid email or password.';
        break;
      case 'auth/popup-closed-by-user':
        msg = 'Google sign-in popup was closed.';
        break;
      case 'auth/unauthorized-domain':
        msg = 'This domain is not authorized in Firebase.';
        break;
    }
    alert(msg);
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    if (!auth) return;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCred.user, { displayName: values.displayName });
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const SignInForm = () => (
    <Form {...signInForm}>
      <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
        <FormField
          control={signInForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signInForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  );

  const SignUpForm = () => (
    <Form {...signUpForm}>
      <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
        <FormField
          control={signUpForm.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signUpForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signUpForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </Form>
  );
  
  if (authLoading) {
    return (
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Checking Session</CardTitle>
          <CardDescription>Please wait...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <div className="loading-spinner"></div>
        </CardContent>
      </Card>
    );
  }

  if (!auth) {
    return (
      <Card className="w-full max-w-md bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive-foreground text-center">Firebase Not Configured</CardTitle>
          <CardDescription className="text-destructive-foreground/80 text-center">
            The connection to Firebase could not be established.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-destructive-foreground/90 text-sm">
          <p>Please ensure your environment variables are set correctly in a <strong>.env.local</strong> file.</p>
          <p className="mt-2">You need to add the following variables:</p>
          <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs overflow-x-auto">
            <code>
              NEXT_PUBLIC_FIREBASE_API_KEY=...<br/>
              NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...<br/>
              NEXT_PUBLIC_FIREBASE_PROJECT_ID=...<br/>
              NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...<br/>
              NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...<br/>
              NEXT_PUBLIC_FIREBASE_APP_ID=...<br/>
            </code>
          </pre>
        </CardContent>
      </Card>
    );
  }

  if (user) return null;

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
            <SignInForm />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <SignUpForm />
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

        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 488 512">
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2C322.3 119.3 286.5 96 248 96c-88.8 0-160 72.2-160 160s71.2 160 160 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"
            />
          </svg>
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
