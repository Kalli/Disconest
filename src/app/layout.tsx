import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://disconest.com'),
  description: 'Get the key, tempo and other musical metadata for your records.',
  authors: [{name: 'Karl Tryggvason'}],
  openGraph: {
    images: ['/img/disconest-1.png'],
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://api.pirsch.io/pa.js" id="pianjs" data-code="NKp6czLJYFAYtLSKSgARgm3LIxGlhMLg"></script>
        <title>Disconest - Musical metadata for your Records</title>
      </head>
      {/* ToDo refactor useSearchParams so we don't need to wrap entire body in suspense */}
      <Suspense>
      <body className={inter.className}>{children}</body>
      </Suspense>
    </html>
  );
}
