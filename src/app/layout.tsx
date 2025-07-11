
import type {Metadata} from 'next';
import { Inter as FontInter, Space_Grotesk as FontSpaceGrotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import AIChatWidget from '@/components/AIChatWidget';

const fontInter = FontInter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontSpaceGrotesk = FontSpaceGrotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'CodeSage - Professional Programming Platform',
  description: 'Professional-grade development platform for FTC robotics teams. Build, analyze, and deploy with confidence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${fontInter.variable} ${fontSpaceGrotesk.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <AIChatWidget />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
