import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "المُفيد — رفيقك الدراسي السحري",
  description:
    "منصة تعليمية مغربية تحوّل مراجعة الدروس إلى مغامرة حديقة سحرية، بديلاً اقتصادياً وممتعاً عن الدروس الخصوصية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
