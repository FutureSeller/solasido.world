import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import { QueryProvider } from '@/components/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '그냥, 여우',
  description: '우당탕탕 여우의 신혼 일상툰',
  keywords: [
    '여우',
    '그냥',
    '신혼',
    '일상',
    '인스타툰',
    '일상툰',
    '여우툰',
    '솔라시도',
  ],
  verification: {
    other: {
      'naver-site-verification': '55618a448f3dd4d5ac9ac66d2e74c65530b8cdc7',
    },
  },
  openGraph: {
    url: 'https://dopamine.solasido.world',
    title: '그냥, 여우!',
    description: '우당탕탕 여우의 신혼 일상툰',
    type: 'article',
    images: ['https://dopamine.solasido.world/opengraph-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '그냥, 여우!',
    description: '우당탕탕 여우의 신혼 일상툰',
    creator: '@solasido_pamine',
    images: [
      {
        url: 'https://dopamine.solasido.world/twitter-image.jpeg',
        alt: '그냥, 여우!',
        width: 1200,
        height: 630,
      },
    ],
  },
  other: {
    viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={[inter.className, 'pb-safe'].join(' ')}>
        <QueryProvider>
          <main className="flex min-h-screen flex-col items-center justify-between py-4 sm:py-8 bg-black text-white">
            {props.children}
            <SpeedInsights />
          </main>
          <div id="modal-root" />
        </QueryProvider>
      </body>
      <GoogleAnalytics gaId="G-WF4EN5RSE1" />
    </html>
  );
}
