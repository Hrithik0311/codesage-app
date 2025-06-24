
'use client';

import type { z } from 'zod';
import type { UseFormReturn } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
type SignInSchema = z.infer<typeof signInSchema>;

const signUpSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
type SignUpSchema = z.infer<typeof signUpSchema>;

interface SignInFormProps {
  form: UseFormReturn<SignInSchema>;
  onSubmit: (values: SignInSchema) => void;
  isLoading: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ form, onSubmit, isLoading }) => {
  const { formState } = form;
  const isDisabled = isLoading || formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isDisabled} />
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
                <Input type="password" placeholder="••••••••" {...field} disabled={isDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isDisabled}>
          {isDisabled ? 'Processing...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
};

interface SignUpFormProps {
  form: UseFormReturn<SignUpSchema>;
  onSubmit: (values: SignUpSchema) => void;
  isLoading: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ form, onSubmit, isLoading }) => {
  const { formState } = form;
  const isDisabled = isLoading || formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} disabled={isDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isDisabled} />
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
                <Input type="password" placeholder="••••••••" {...field} disabled={isDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isDisabled}>
          {isDisabled ? 'Processing...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
};

export default function AuthClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  const signInForm = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleAuthError = (error: any) => {
    console.error('Authentication Error:', error);
    let description = 'An unexpected error occurred. Please try again.';
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
    } else if (error.code === 'auth/popup-closed-by-user') {
      description = 'The sign-in window was closed. Please try again.';
    }
    console.error('Authentication Failed', description);
  };

  const handleSignIn = async (values: SignInSchema) => {
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

  const handleSignUp = async (values: SignUpSchema) => {
    if (!auth) return;
    setIsProcessingAuth(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.displayName });
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
      const result = await signInWithPopup(auth, provider);
      console.log(`Welcome, ${result.user.displayName || result.user.email}`);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const globalIsLoading = authLoading || isProcessingAuth;

  if (authLoading && !isProcessingAuth) {
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
            <SignInForm form={signInForm} onSubmit={handleSignIn} isLoading={globalIsLoading} />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <SignUpForm form={signUpForm} onSubmit={handleSignUp} isLoading={globalIsLoading} />
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

        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={globalIsLoading}>
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
