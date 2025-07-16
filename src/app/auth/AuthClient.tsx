
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
import { getFirebaseServices } from '@/lib/firebase';
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
import { sendNotificationEmail } from '@/ai/flows/send-notification-email';
import { useToast } from '@/hooks/use-toast';

const { auth } = getFirebaseServices();

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
  const [isJustLoggedIn, setIsJustLoggedIn] = useState(false);
  const { toast } = useToast();

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
        if (isJustLoggedIn) {
            if (user.email) {
                sendNotificationEmail({
                    to: user.email,
                    subject: 'Successful Login to CodeSage',
                    body: `<h1>Login Alert</h1><p>We detected a new login to your CodeSage account. If this was not you, please secure your account.</p>`
                }).catch(e => console.error("Failed to send login email:", e));
            }
            setIsJustLoggedIn(false);
        }
        router.push('/dashboard');
    }
  }, [user, authLoading, router, isJustLoggedIn]);

  const handleAuthError = (error: any) => {
    let title = 'Authentication Error';
    let description = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        title = 'Sign-Up Failed';
        description = 'This email address is already in use. Please try logging in.';
        break;
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        title = 'Login Failed';
        description = 'The email or password you entered is incorrect.';
        break;
      case 'auth/popup-closed-by-user':
        title = 'Sign-In Cancelled';
        description = 'You closed the Google sign-in window before completing the process.';
        break;
      case 'auth/unauthorized-domain':
        title = 'Configuration Error';
        description = 'This domain is not authorized for Google sign-in in the Firebase console.';
        break;
      case 'auth/too-many-requests':
        title = 'Too Many Attempts';
        description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
        break;
      default:
        console.error('Unhandled Auth Error:', error);
    }
    
    toast({
      variant: 'destructive',
      title: title,
      description: description,
    });
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      setIsJustLoggedIn(true);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCred.user, { displayName: values.displayName });
      setIsJustLoggedIn(true);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setIsJustLoggedIn(true);
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

  // This check is a safeguard, but the config error should now be resolved.
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return (
      <Card className="w-full max-w-md bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive-foreground text-center">Firebase Not Configured</CardTitle>
          <CardDescription className="text-destructive-foreground/80 text-center">
            The connection to Firebase could not be established.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-destructive-foreground/90 text-sm">
          <p>Please ensure your environment variables are set correctly in a <strong>.env.local</strong> file for local development or in your hosting provider's settings for deployment.</p>
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
