"use client";

import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/providers/providers';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

/**
 * Root Layout
 * Manages the conditional rendering of the AppShell vs a simple layout
 * based on the current path.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Routes that should NOT use the AppShell (Sidebar/Navigation)
  const simpleLayoutRoutes = [
    '/auth',
    '/about',
    '/impressum',
    '/privacy-policy',
    '/terms-of-use',
    '/view-infographics',
  ];

  // The landing page ('/') and simple routes use a clean layout.
  // Dashboard and study routes use the AppShell.
  const isSimpleRoute = pathname === '/' || simpleLayoutRoutes.some(prefix => pathname.startsWith(prefix));
  const useAppShell = !isSimpleRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <div className="background-container">
          <Providers>
            {useAppShell ? <AppShell>{children}</AppShell> : <>{children}</>}
          </Providers>
        </div>
      </body>
    </html>
  );
}
