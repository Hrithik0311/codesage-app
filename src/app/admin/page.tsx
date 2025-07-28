
import type { Metadata } from 'next';
import AdminClient from './AdminClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - CodeSage',
  description: 'Manage users and application data.',
};

export default function AdminPage() {
  return (
    <main className="relative z-10">
       <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center bg-background"><div className="loading-spinner"></div></div>}>
        <AdminClient />
      </Suspense>
    </main>
  );
}
