
import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings - CodeSage',
  description: 'Manage your account and application settings.',
};

export default function SettingsPage() {
  return (
    <main className="relative z-10">
      <SettingsClient />
    </main>
  );
}
