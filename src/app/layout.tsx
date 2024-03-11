import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
        <title>Disconest - Musical metadata for your Records</title>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
