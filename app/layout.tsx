import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
import '@/lib/env';
import SiteLayout from '@/components/layout/SiteLayout';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Alpha Retreats — Built for Men. Forged in the Wild.',
    template: '%s | Alpha Retreats',
  },
  description:
    'Premium men-only retreat experiences. 3–7 days of ice baths, wilderness hiking, fire cooking, motorcycling, and brotherhood. Global locations.',
  keywords: ['mens retreat', 'alpha retreats', 'wilderness retreat', 'mens adventure', 'corporate offsite'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Alpha Retreats',
    title: 'Alpha Retreats — Built for Men. Forged in the Wild.',
    description:
      'Premium men-only retreat experiences. 3–7 days of ice baths, wilderness hiking, fire cooking, motorcycling, and brotherhood.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        width: 1200,
        height: 630,
        alt: 'Alpha Retreats — Men forged in the wild',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} scroll-smooth`}>
      <body className="bg-dark-bg text-off-white font-body antialiased">
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
