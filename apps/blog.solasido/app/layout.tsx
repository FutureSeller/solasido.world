import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SOLASIDO.LOG",
    template: "%s | SOLASIDO.LOG",
  },
  description: "일상, 소비, 여행, 게임 기록 블로그",
  keywords: ["블로그", "일상", "여행", "게임", "리뷰"],
  authors: [{ name: "Solasido" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "SOLASIDO.LOG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
