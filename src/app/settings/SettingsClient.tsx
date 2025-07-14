
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck, User, Trash2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/UserProfile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';


const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name cannot exceed 50 characters.' }),
});

export default function SettingsClient() {
  const { user, loading, resetAllProgress, deleteAccountData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
    if (user) {
        form.reset({ displayName: user.displayName || '' });
    }
  }, [user, loading, router, form]);

  const handleUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: values.displayName });
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
      // Force a reload of the user object in the auth context, if not automatically updated
      router.refresh(); 
    } catch (error) {
      console.error('Profile update failed:', error);
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating your profile.',
        variant: 'destructive',
      });
    }
  };
  
  const handleResetProgress = () => {
      resetAllProgress();
      toast({
        title: 'Progress Reset',
        description: 'All your lesson progress has been reset.',
      });
  }
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
        await deleteAccountData();
        await user.delete();
        toast({
            title: 'Account Deleted',
            description: 'Your account and all associated data have been successfully deleted.',
        });
        router.push('/');
    } catch (error) {
        console.error('Account deletion failed:', error);
        toast({
            title: 'Deletion Failed',
            description: 'Could not delete your account. Please log out and log back in, then try again.',
            variant: 'destructive',
        });
    }
  };


  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-xl border-b border-border/30">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
                    <ShieldCheck size={20} />
                </div>
                <span className="text-xl font-headline font-bold">CodeSage</span>
            </Link>
            <div className="flex items-center gap-2">
                <UserProfile />
            </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <section className="mb-12 animate-fade-in-up-hero">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
                General Settings
            </h1>
            <p className="text-foreground/80 mt-4 max-w-2xl text-lg">
                Manage your account information and application preferences.
            </p>
        </section>

        <div className="max-w-2xl mx-auto space-y-12">
            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><User /> Profile Information</CardTitle>
                    <CardDescription>Update your display name.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUpdateProfile)}>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <Input value={user.email || 'No email associated'} readOnly disabled />
                            </FormItem>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card className="bg-card/80 backdrop-blur-md shadow-2xl border-destructive/50 border">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-destructive">Danger Zone</CardTitle>
                    <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border/50">
                        <div>
                            <h4 className="font-semibold text-foreground">Reset All Progress</h4>
                            <p className="text-sm text-muted-foreground">Permanently delete all of your lesson completion data.</p>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="mt-3 sm:mt-0">
                                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will reset all your lesson and quiz progress. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleResetProgress} className={buttonVariants({variant: 'destructive'})}>Yes, reset progress</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-destructive/80 bg-destructive/10">
                         <div>
                            <h4 className="font-semibold text-destructive-foreground">Delete Account</h4>
                            <p className="text-sm text-destructive-foreground/80">Permanently delete your account and all associated data.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="mt-3 sm:mt-0">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your account, team associations, and all related data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAccount} className={buttonVariants({variant: 'destructive'})}>Yes, delete my account</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
