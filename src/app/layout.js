import { Suspense } from 'react';
import { Inter, Sora } from 'next/font/google';
import { Toaster } from 'sonner';
import NavigationProgress from '@/components/NavigationProgress';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
});

export const metadata = {
  title: "GenSolve Academy — Flagship Frontend Development Program",
  description: "GenSolve Academy is a leading academic and skill development platform. Master frontend web development with mentor feedback and private video access.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable} ${sora.variable}`} suppressHydrationWarning>
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
