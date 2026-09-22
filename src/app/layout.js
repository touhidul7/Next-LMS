import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import NavigationProgress from '@/components/NavigationProgress';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  title: "Next LMS — 4-Month Frontend Development Program",
  description: "Master modern frontend web development from fundamentals to professional React & Next.js projects with mentor feedback and private video access.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 font-sans font-normal" suppressHydrationWarning>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
